var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Cmps';

router.get('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var email = req.query.email;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      if (email)
         cnn.chkQry('select * from Person where email = ?',
            [email], cb);
      else
         cb(null, null, cb);
   },
   function (Owner, fields, cb) {
      if (Owner) {
         if (vld.check(Owner.length, Tags.badValue, null))
            cnn.chkQry('select * from Competition where ownerId = ?'
               , [Owner[0].id], cb);
      }
      else
         cnn.chkQry('select * from Competition', null, cb);
   },
   function (result, fields, cb) {
      res.json(result);
   
      res.status(200);
   
      cb();
   }
   ],
   function () {
      cnn.release();
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["title", "ctpId", "prms"], cb) &&
            vld.checkAdmin()) {
         body.ownerId = ssn.id;
         cnn.chkQry('select * from Competition where title = ? and ownerId = ?',
            [body.title, body.ownerId ], cb);
      }
   },
   function (existingCmp, fields, cb) {
      // If no duplicates, insert new competitionType
      if (vld.check(!existingCmp.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry('insert into Competition set ?', body, cb);
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
   
   req.cnn.query('select * from Competition where id = ?', [req.params.id],
   function (err, cmpArr) {
      if (vld.check(cmpArr.length, Tags.notFound)) {
         res.json(cmpArr);
      }
      req.cnn.release();
   });
});

router.put('/:id', function (req, res) {
   var vld = req.validator;
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["title", "prms"]).checkAdmin())
         cnn.chkQry("select * from Competition where id = ? ",
            req.params.id, cb);
   },
   function (qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         if (body.title)
            cnn.chkQry(
             "select * from Competition where title = ? and ownerId = ?",
             [body.title,ssn.id], cb);
         else
            cb(null,null,cb);
      }
   },
   function (titleRes, fields, cb) {
      if (!body.title ||
         vld.check(!titleRes.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update Competition set ? where id = ?",
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
   
   if (vld.checkAdmin())
      req.cnn.query('delete from Competition where id = ?', [req.params.id],
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