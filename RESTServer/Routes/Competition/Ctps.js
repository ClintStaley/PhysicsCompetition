var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Ctps';

router.get('/', (req, res) => {
   req.cnn.chkQry('select * from CompetitionType', null,
   (err, result) => {
      res.json(result);
      res.status(200);
      req.cnn.release();
   });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
   if (vld.checkAdmin())
      async.waterfall([
      (cb) => {
         if (vld.hasFields(body, ["title", "description", "prmSchema"], cb)) {
            cnn.chkQry('select * from CompetitionType where title = ?',
             body.title, cb);
         }
      },
      (existingCtp, fields, cb) => {
         // If no duplicates, insert new competitionType
         if (vld.check(!existingCtp.length, Tags.dupTitle, cb)) {
          cnn.chkQry('insert into CompetitionType set ?', body, cb);
         }
      },
      (result, fields, cb) => {
         // Return location of inserted competitionType
         res.location(router.baseURL + '/' + result.insertId).end();
         cb();
      }],
      () => {
         cnn.release();
      });
   else
      cnn.release();
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   req.cnn.query('select * from CompetitionType where id = ?', [req.params.id],
   (err, ctpArr) => {
      if (vld.check(ctpArr.length, Tags.notFound)) {
         res.json(ctpArr[0]);
      }
      req.cnn.release();
   });
});

router.put('/:id', (req, res) => {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      if (vld.hasOnlyFields(body, ["title", "description","prmSchema"])
       .checkAdmin())
         cnn.chkQry('select * from CompetitionType where id = ?',
          req.params.id, cb);
   },
   (qRes, fields, cb) => {
      if (vld.check(qRes.length, Tags.notFound, cb)) {
         if (body.title)
            cnn.chkQry('select * from CompetitionType where title = ?',
             body.title, cb);
         else
            cb(null,null,cb);
      }
   },
   (titleRes, fields, cb) => {
      if (!body.title ||
         vld.check(!titleRes.length, Tags.dupTitle, cb))
         cnn.chkQry('update CompetitionType set ? where id = ?',
          [req.body, req.params.id], cb);
   },
   (updRes, fields, cb) => {
      res.status(200).end();
      cb();
   }],
   () => {
      cnn.release();
   });
});

router.delete('/:id', (req, res) => {
   var vld = req.validator;

   if (vld.checkAdmin()) {
      async.waterfall([
      (cb) => {
         req.cnn.query('delete from CompetitionType where id = ?',
          [req.params.id], cb);
      },
      (result, err, cb) => {
         if (vld.check(!err && result.affectedRows, Tags.notFound))
            res.status(200).end();
         cb();
      }],
      () => {
         req.cnn.release();
      });
   }
   else {
      req.cnn.release();
   }
});


module.exports = router;
