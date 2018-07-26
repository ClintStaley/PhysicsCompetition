var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Sbms';

router.get('/', (req, res) => {
   var num = req.query.num;

   req.cnn.chkQry('select id, teamId, content, response, score, subTime, ' +
    'practiceRun from Submit where cmpId = ? && teamId = ?' +
    ' order by subTime DESC',
    [req.params.cmpId, req.params.teamId],
   //function that closes cnn
   (err, result) => {
      if (num || num == 0)
         result = result.slice(0,num);
      res.json(result);
      res.status(200);
      req.cnn.release();
   });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      if (vld.hasOnlyFields(body, ["content"], cb)) {
         if (vld.check(( !body.response || vld.checkAdmin()),
          Tags.forbiddenField, cb)) {
            body.cmpId = req.params.cmpId;
            body.teamId = req.params.teamId;
            body.subTime = new Date();
            cnn.chkQry('insert into Submit set ?', body, cb);
         }
      }
   },
   (result, fields, cb) => {
      // Return location of inserted Submissions
      res.location(router.baseURL.replace(":cmpId", req.params.cmpId)
      .replace(":teamId", req.params.teamId) + '/' + result.insertId).end();
      cb();
   }],
   () => {
      cnn.release();
   });
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   req.cnn.query('select id, teamId, content, response, score, subTime ,' +
    'practiceRun  from Submit where id = ? && cmpId = ? && teamId = ?',
    [req.params.id,req.params.cmpId,req.params.teamId],
   (err, teamArr) => {
      if (vld.check(teamArr.length, Tags.notFound)) {
         res.json(teamArr[0]);
      }
      req.cnn.release();
   });
});

router.put('/:id', (req, res) => {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   (cb) => {
      if (vld.hasOnlyFields(body, ["response"], cb)) {
         if (vld.checkAdmin(cb)) {
            body.cmpId = req.params.cmpId;
            body.teamId = req.params.teamId;
            body.subTime = new Date();
            cnn.chkQry('select * from Submit where id = ? && cmpId = ? && ' +
             'teamId = ?',
             [req.params.id, req.params.cmpId, req.params.teamId], cb);
         }
      }
   },
   (result, err, cb) => {
      if (vld.check(result && result.length, Tags.notFound, cb))
         cnn.query("update Submit set ? where id = ?",
          [req.body, req.params.id], cb);
   },
   (result, fields, cb) => {
      // Return location of inserted Submissions
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   () => {
      res.status(200);
      cnn.release();
   });
});

module.exports = router;
