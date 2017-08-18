var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Cmps';

router.get('/', function (req, res) {
   var email = req.query.email;
   var cnn = req.cnn;
   var query = 'select * from Competition';
   var fillers = [];
   
   if (email) {
      query = 'select Competition.id,ownerId,ctpId,title,prms from Competition'
       + ',Person where email = ? && Competition.ownerId = Person.id';
      fillers.push(email);
   }
   
   async.waterfall([
   function (cb) {
      cnn.chkQry(query,fillers, cb);
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
   
   if ( vld.checkAdmin())
      async.waterfall([
      function (cb) {
         if (vld.hasFields(body, ["title", "ctpId", "prms"], cb)) {
            body.ownerId = ssn.id;
            cnn.chkQry('select * from Competition where title = ? and ownerId = ?',
               [body.title, body.ownerId], cb);
         }
      },
      function (existingCmp, fields, cb) {
         // If no duplicates, insert new competition
         if (vld.check(!existingCmp.length, Tags.dupTitle, null, cb)) {
            cnn.chkQry('insert into Competition set ?', body, cb);
         }
      },
      function (result, fields, cb) {
         // Return location of inserted competition
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
   if (vld.checkAdmin())
      async.waterfall([
      function (cb) {
         if (vld.hasOnlyFields(body, ["title", "prms"]))
            cnn.chkQry("select * from Competition where id = ?",
               req.params.id, cb);
      },
      function (qRes, fields, cb) {
         if (vld.check(qRes.length, Tags.notFound, null, cb)) {
            if (body.title)
               cnn.chkQry(
                  "select * from Competition where title = ? and ownerId = ?",
                  [body.title, ssn.id], cb);
            else
               cb(null, null, cb);
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
   else
      cnn.release();
});

router.delete('/:id', function (req, res) {
   var vld = req.validator;
   
   if (vld.checkAdmin()) {
      req.cnn.query('delete from Competition where id = ?', [req.params.id],
      function (err, result) {
         if (!err && vld.check(result.affectedRows, Tags.notFound))
            res.status(200).end();
         req.cnn.release();
      });
   }
   else {
      req.cnn.release();
   }
});

module.exports = router;