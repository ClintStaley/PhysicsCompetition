var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Mmbs';

router.get('/', (req, res) => {

   req.cnn.chkQry('select id,firstName,lastName,email from Person,Membership' +
    ' where prsId = id && teamId = ?', [req.params.teamId],
   (err, result) => {
      res.json(result);
      res.status(200);
      req.cnn.release();
   });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      //
      if (vld.hasFields(body, ["prsId"], cb)) {
         body.teamId = req.params.teamId;
         cnn.chkQry('select ownerId from Team where id = ?', body.teamId, cb);
      }
   },
   (result, fields, cb) => {
      //check if post is from admin or team leader
      if (vld.check(ssn && (ssn.isAdmin() ||
       (result && result.length && ssn.id == result[0].ownerId)
       || ssn.id == body.prsId), Tags.noPermission, cb))
         cnn.chkQry('select * from Membership where prsId = ? && teamId = ?',
          [body.prsId,body.teamId], cb);
   },
   (result, fields, cb) => {
      if (vld.check(result && !result.length, Tags.dupEnrollment, cb)) {
         cnn.chkQry('insert into Membership set ?', body, cb);
      }
   },
   (result, fields, cb) => {
      // Return location of inserted Member
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   () => {
      cnn.release();
   });
});

router.delete('/:id', (req, res) => {
   var vld = req.validator;
   var ssn = req.session;
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      cnn.chkQry('select ownerId from Team where id = ?',
       [req.params.teamId], cb);
   },
   (result, fields, cb) => {
      if (vld.check(result && result.length , Tags.notFound, cb))
         if (vld.chain(ssn && (ssn.isAdmin() ||
          ssn.id == result[0].ownerId || ssn.id == req.params.id),
          Tags.noPermission,null).
          check(!(result[0].ownerId == req.params.id),
          Tags.cantRemoveLeader, cb))
            req.cnn.query('delete from Membership where prsId = ? && teamId = ?'
             , [req.params.id, req.params.teamId], cb);
   }],
   (err, result) => {
      if (!err && vld.check(result.affectedRows, Tags.notFound))
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;
