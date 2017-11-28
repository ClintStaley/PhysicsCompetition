var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Mmbs';

router.get('/', function (req, res) {

   req.cnn.chkQry('select id,firstName,lastName,email from Person,Membership' +
         ' where personId = id && teamId = ?', [req.params.teamId],
   function (err, result) {
      res.json(result);

      res.status(200);

      req.cnn.release();
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      //
      if (vld.hasFields(body, ["personId"], cb)) {
         body.teamId = req.params.teamId;
         cnn.chkQry('select ownerId from Team where id = ?',
               body.teamId, cb);
      }
   },
   function (result, fields, cb) {
      //check if post is from admin or team leader
      if (vld.check(ssn && (ssn.isAdmin() ||
            (result && result.length && ssn.id == result[0].ownerId)
            || ssn.id == body.personId), Tags.noPermission, null, cb))
         cnn.chkQry('select * from Membership where personId = ? && teamId = ?',
            [body.personId,body.teamId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(result && !result.length, Tags.dupEnrollment, null, cb)) {
         cnn.chkQry('insert into Membership set ?', body, cb);

      }
   },
   function (result, fields, cb) {
      // Return location of inserted Member
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.delete('/:id', function (req, res) {
   var vld = req.validator;
   var ssn = req.session;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select ownerId from Team where id = ?',
         [req.params.teamId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(result && result.length , Tags.notFound, null, cb))
         if (vld.chain(ssn && (ssn.isAdmin() ||
               ssn.id == result[0].ownerId || ssn.id == req.params.id),
               Tags.noPermission,null).
               check(!(result[0].ownerId == req.params.id),
               Tags.cantRemoveLeader,null, cb))
            req.cnn.query('delete from Membership where personId = ? && teamId = ?'
                , [req.params.id, req.params.teamId], cb);
   }],
   function (err, result) {
      if (!err && vld.check(result.affectedRows, Tags.notFound))
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;
