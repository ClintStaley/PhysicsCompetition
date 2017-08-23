var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Prss';

router.get('/', function(req, res) {
   var ssn = req.session;
   var clause = '';
   var fillers = [];
   var email = req.query.email;

   if (email) {
      clause = " where email like ?";
      fillers.push(email + ('%'));
   }
   if (!ssn.isAdmin()) {
      clause += (clause ? ' and' : ' where') + ' id = ?';
      fillers.push(ssn.id);
   }
   req.cnn.chkQry('select id, email from Person' + clause, fillers,
   function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   });
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

// CAS FIX Didn't we say to drop this?
   if (admin && !body.password)
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb) &&
       vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role === 0 || body.role === 1, Tags.badValue, ["role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted = body.termsAccepted ? new Date() : null;
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var vld = req.validator;
   var prs;

   if (vld.checkPrsOK(req.params.id)) {
      req.cnn.query('select * from Person where id = ?', [req.params.id],
      function(err, prsArr) {
         if (vld.check(prsArr.length, Tags.notFound)) {
             prs = prsArr[0];
             prs.termsAccepted = prs.termsAccepted
              && prs.termsAccepted.getTime();
             prs.whenRegistered = prs.whenRegistered
              && prs.whenRegistered.getTime();

                delete prs.password;
             res.json(prsArr);
         }
         req.cnn.release();
      });
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (
        (vld.checkPrsOK(req.params.id, cb)) &&
        vld.hasOnlyFields(body,
        ["firstName", "lastName", "password", "oldPassword", "role"])
       .chain(!("password" in body) || body.password, Tags.badValue, ["password"])
       .chain(!body.role || admin && body.role === 1, Tags.badValue, ["role"])
       .check(!body.password || body.oldPassword || admin, Tags.noOldPwd,
        null, cb))
         cnn.chkQry("select * from Person where id = ? ", req.params.id, cb);
   },
   function(qRes, fields, cb) {
      if (vld.check(admin || !body.password ||
       qRes[0].password === body.oldPassword, Tags.oldPwdMismatch, null, cb)) {
         delete req.body.oldPassword;
         cnn.chkQry("update Person set ? where id = ?",
          [req.body, req.params.id], cb);
      }
   },
   function(updRes, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkAdmin())
      req.cnn.query('DELETE from Person where id = ?',
       [ req.params.id],
      function (err, result) {
         if (!err && vld.check(result.affectedRows, Tags.notFound))
            res.status(200).end();
         req.cnn.release();
      });
   else {
      req.cnn.release();
   }
});


module.exports = router;
