var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams';

router.get('/', function (req, res) {
   
   req.cnn.chkQry('select * from Teams where cmpId = ?', req.params.cmpId,
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
      if (vld.hasFields(body, ["teamName"], cb)) {
         body.ownerId = ssn.id;
         body.cmpId = req.params.cmpId;
         cnn.chkQry('select * from Teams where teamName = ? and cmpId = ?',
            [body.teamName, body.cmpId ], cb);
      }
   },
   function (existingTm, fields, cb) {
      // If no duplicates, insert new competitionType
      if (vld.check(!existingTm.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry('insert into Teams set ?', body, cb);
      }
   },
   function (result, fields, cb) {
      // Return location of inserted competitionType
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.get('/:id', function (req, res) {
   var vld = req.validator;
   
   req.cnn.query('select * from Teams where id = ? && cmpId = ?',
    [req.params.id,req.params.cmpId],
   function (err, teamArr) {
      if (vld.check(teamArr.length, Tags.notFound)) {
         res.json(teamArr);
      }
      req.cnn.release();
   });
});

router.put('/:id', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["teamName"]))
         cnn.chkQry("select * from Teams where id = ? && cmpId = ?",
            [req.params.id,req.params.cmpId], cb);
   },
   function (qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         if (body.teamName && vld.checkPrsOK(qRes.ownerId,cb))
            cnn.chkQry("select * from Teams where teamName = ?",
               [body.teamName], cb);
         else
            cb(null,null,cb);
      }
   },
   function (nameRes, fields, cb) {
      if (!body.teamName ||
         vld.check(!nameRes.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update Teams set ? where id = ?",
            [req.body, req.params.id], cb);
   },
   function (updRes, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.delete('/:id', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      cnn.chkQry('select ownerId from Teams where id = ? && cmpId = ?',
         [req.params.id,req.params.cmpId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(result.length , Tags.notFound, null, cb))
         if (vld.checkPrsOK(result[0].ownerId))
            req.cnn.query('delete from Teams where id = ? && cmpId = ?',
               [req.params.id, req.params.cmpId], cb);
   }],
   function (err, result,cb) {
      if (!err && vld.check(result.affectedRows, Tags.notFound))
         res.status(200).end();
      console.log("Here");
      cnn.release();
   });
});

module.exports = router;