var express = require('express');
var Tags = require('../Validator.js').Tags;
var router = express.Router({caseSensitive: true});
var async = require('async');
var crypto = require("crypto");

var firstLimit = 30;
var lastLimit = 50;
var passLimit = 50
var emailLimit = 150;

router.baseURL = '/Prss';

router.get('/', (req, res) => {
   var ssn = req.session;
   var clause = '';
   var fillers = [];
   var emailPrefix = req.query.email;


   // Add email prefix qualifier if requested
   if (emailPrefix) {
      clause += clause ? " and " : " where ";
      clause += "email like ?";
      fillers.push(emailPrefix + '%');
   }

   req.cnn.chkQry('select id, email from Person' + clause, fillers,
   (err, result) => {
      res.json(result);
      req.cnn.release();
   });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   body.whenRegistered = new Date();

   async.waterfall([
   (cb) => { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email","firstName", "lastName", "password",
       "role"], cb) && vld.checkFieldLengths(body,["email","firstName",
       "lastName","password"],[emailLimit,firstLimit,lastLimit,passLimit]) &&
       vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role === 0 || body.role === 1, [Tags.badValue, "role"], cb)){
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   (prs, fields, cb) => {  // If no duplicates, insert new Person
      if (vld.check(!prs.length, Tags.dupEmail, cb)) {
         body.password = crypto.createHash('sha1')
          .update(body.password).digest('hex');
         body.termsAccepted = body.termsAccepted ? new Date() : null;
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   (result, fields, cb) => { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   (err) => {
      cnn.release();
   });
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   
   req.cnn.query('select * from Person where id = ?', [req.params.id],
   (err, prsArr) => {
      if (vld.check(prsArr.length, Tags.notFound)) {
          var prs = prsArr[0];
          prs.termsAccepted = prs.termsAccepted
           && prs.termsAccepted.getTime();
          prs.whenRegistered = prs.whenRegistered
           && prs.whenRegistered.getTime();

          delete prs.password;
          res.json(prs);
      }
      req.cnn.release();
   });
});

router.put('/:id', (req, res) => {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   if (body.oldPassword)
      body.oldPassword =
       crypto.createHash('sha1').update(body.oldPassword).digest('hex');

   if (body.password)
      body.password =
       crypto.createHash('sha1').update(body.password).digest('hex');

   async.waterfall([
   (cb) => {
      if (
       (vld.checkPrsOK(req.params.id, cb)) &&
       vld.hasOnlyFields(body,
       ["firstName", "lastName", "password", "oldPassword", "role"]) &&
       vld.checkFieldLengths(body,["firstName","lastName","password","oldPassword",],
       [firstLimit,lastLimit,passLimit,passLimit])
       .chain(!("password" in body) || body.password, [Tags.badValue,"password"])
       .chain(!body.role || admin && body.role === 1, [Tags.badValue,"role"])
       .check(!body.password || body.oldPassword || admin, Tags.noOldPwd, cb))
         cnn.chkQry("select * from Person where id = ? ", req.params.id, cb);
   },
   (prs, fields, cb) => {
      if (vld.check(admin || !body.password ||
       prs[0].password === body.oldPassword, Tags.oldPwdMismatch, cb)) {
         delete req.body.oldPassword;
         cnn.chkQry("update Person set ? where id = ?",
          [req.body, req.params.id], cb);
      }
   },
   (result, fields, cb) => {
      res.status(200).end();
      cb();
   }],
   () => {
      cnn.release();
   });
});

router.delete('/:id', (req, res) => {
   var vld = req.validator;

   if (vld.checkAdmin())
      req.cnn.query('DELETE from Person where id = ?',
       [ req.params.id],
      (err, result) => {
         if (!err && vld.check(result.affectedRows, Tags.notFound))
            res.status(200).end();
         req.cnn.release();
      });
   else
      req.cnn.release();
});

router.get('/:id/Teams', (req, res) => {
   var vld = req.validator;
   var teams = [];

   if (vld.checkPrsOK(req.params.id))
      req.cnn.chkQry('select id, bestScore, teamName, cmpId, leaderId, ' +
       'lastSubmit, canSubmit from Team, Membership where ' +
       'prsId =  ? and teamId = Team.id', [req.params.id],
      (err, teams) => {
         res.json(teams);
         res.status(200);
         req.cnn.release();
      });
   else
      req.cnn.release();
});

router.get('/:id/Cmps', (req, res) => {
   var vld = req.validator;
   var teams = [];

   if (vld.checkPrsOK(req.params.id))
      req.cnn.chkQry('select distinct Competition.id as id, ownerId, ctpId,' +
       ' title, prms, rules, hints, curTeamId, description from Competition,' +
       ' Team, Membership where prsId = ? and teamId = Team.id and' +
       ' cmpId = Competition.id',
       [req.params.id],
      (err, cmps) => {
         res.json(cmps);
         res.status(200);
         req.cnn.release();
      });
   else
      req.cnn.release();
});


module.exports = router;
