var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Ctps';

router.get('/', function (req, res) {

   // CAS FIX: Pls promptly remove debug logs as early as possible.  They
   // tend to accumulate otherwise.
   console.log("#####Recived Request###");

   // CAS FIX: Style says to put the "f" in function under the "r" in req
   req.cnn.chkQry('select * from CompetitionType', null, function (err, result) {
      res.json(result);

      console.log("#####Recived CompetitionTypes###");

      res.status(200);

      req.cnn.release();
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
   // CAS FIX One blank line at a time except in extreme separation cases.

   async.waterfall([
   function (cb) { // Check properties and search for title duplicates
      console.log('#####Started Posting Check####');

      // CAS FIX We need to either use 1-space continuation-line indents, or
      // six-space.  Three-space confuses continuation lines with contained
      // body lines.
      if (vld.hasFields(body, ["title", "description"], cb) &&
      // vld.checkAdmin.  Pls review Validator carefully and *use* its features
      // when available.  DRY.
         vld.check(admin, Tags.noPermission, null, cb)) {
         cnn.chkQry('select * from CompetitionType where title = ?', body.title, cb);
      }
   },
   function (existingCtp, fields, cb) {  // If no duplicates, insert new competitionType
      console.log('#####Checking title availability####');
      if (vld.check(!existingCtp.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry('insert into CompetitionType set ?', body, cb);
      }
   },
   function (result, fields, cb) { // Return location of inserted competitionType
      console.log('#####Finished updating CompType####');
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function () {
      console.log('#####Finished Posting CompType####');
      cnn.release();
   });
});

router.get('/:id', function (req, res) {
   var vld = req.validator;


   console.log('#####Get #2####');
   req.cnn.query('select * from CompetitionType where id = ?', [req.params.id],
      function (err, ctpArr) {
         if (vld.check(ctpArr.length, Tags.notFound)) {
            /// CAS FIX no blank line here
            res.json(ctpArr);
         }
         req.cnn.release();
      });
   // Nor here
});




router.put('/:id', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["title", "description"])
            .check(admin, Tags.noPermission, null, cb))
         cnn.chkQry("select * from CompetitionType where id = ? ", req.params.id, cb);
   },
   function (qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         if (body.title)
            cnn.chkQry("select * from CompetitionType where title = ? ",
               body.title, cb);
         else
            cnn.chkQry("select * from CompetitionType where title = ? ",
               qRes[0].title, cb);
      }
   },
   function (titleRes, fields, cb) {
      if (vld.check(titleRes.length === 1, Tags.dupTitle, null, cb))
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

   if (vld.checkAdmin())
      req.cnn.query('DELETE from CompetitionType where id = ?', [req.params.id],
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
