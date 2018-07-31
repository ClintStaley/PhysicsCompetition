var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Prss';

router.get('/', (req, res) => {
   var ssn = req.session;
   var clause = '';
   var fillers = [];
   var email = req.query.email;

   if (email) {
      clause = " where email like ?";
      console.log(clause, email);
      fillers.push(email + ('%'));
   }
   if (!ssn.isAdmin()) {
      clause += (clause ? ' and' : ' where') + ' id = ?';
      fillers.push(ssn.id);
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
      if (vld.hasFields(body, ["email","firstName", "lastName", "password", "role"], cb) &&
       vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role === 0 || body.role === 1, [Tags.badValue, "role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   (prs, fields, cb) => {  // If no duplicates, insert new Person
      if (vld.check(!prs.length, Tags.dupEmail, cb)) {
         body.termsAccepted = body.termsAccepted ? new Date() : null;
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   (result, fields, cb) => { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   () => {
      cnn.release();
   });
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   if (vld.checkPrsOK(req.params.id)) {
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
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', (req, res) => {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      if (
       (vld.checkPrsOK(req.params.id, cb)) &&
       vld.hasOnlyFields(body,
       ["firstName", "lastName", "password", "oldPassword", "role"])
       .chain(!("password" in body) || body.password, Tags.badValue, ["password"])
       .chain(!body.role || admin && body.role === 1, Tags.badValue, ["role"])
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
       ' title, prms, rules, curTeamId from Competition, Team, Membership' +
       ' where prsId = ? and teamId = Team.id and cmpId = Competition.id',
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
