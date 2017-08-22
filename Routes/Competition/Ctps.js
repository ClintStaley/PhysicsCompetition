var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Ctps';

router.get('/', function (req, res) {
   
   req.cnn.chkQry('select * from CompetitionType', null,
   function (err, result) {
      res.json(result);

      res.status(200);

      req.cnn.release();
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
   if (vld.checkAdmin())
      async.waterfall([
      function (cb) {
         if (vld.hasFields(body, ["title", "description", "prmSchema"], cb)) {
            cnn.chkQry('select * from CompetitionType where title = ?',
               body.title, cb);
         }
      },
      function (existingCtp, fields, cb) {
         // If no duplicates, insert new competitionType
         if (vld.check(!existingCtp.length, Tags.dupTitle, null, cb)) {
            cnn.chkQry('insert into CompetitionType set ?', body, cb);
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
   else
      cnn.release();
});

router.get('/:id', function (req, res) {
   var vld = req.validator;

   req.cnn.query('select * from CompetitionType where id = ?', [req.params.id],
   function (err, ctpArr) {
      if (vld.check(ctpArr.length, Tags.notFound)) {
         res.json(ctpArr);
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
      if (vld.hasOnlyFields(body, ["title", "description","prmSchema"]).checkAdmin())
         cnn.chkQry("select * from CompetitionType where id = ? ",
            req.params.id, cb);
   },
   function (qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         if (body.title)
            cnn.chkQry("select * from CompetitionType where title = ? ",
               body.title, cb);
         else
            cb(null,null,cb);
      }
   },
   function (titleRes, fields, cb) {
      if (!body.title ||
         vld.check(!titleRes.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update CompetitionType set ? where id = ?",
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
   
   if (vld.checkAdmin()) {
      async.waterfall([
      function (cb) {
         req.cnn.query(
            'delete from CompetitionType where id = ?', [req.params.id], cb);
      },
      function (result, err, cb) {
         if (vld.check(!err && result.affectedRows, Tags.notFound))
            res.status(200).end();
         cb();
      }],
      function () {
         req.cnn.release();
      });
   }
   else {
      console.log("Right Here?");
      req.cnn.release();
   }
});


module.exports = router;
