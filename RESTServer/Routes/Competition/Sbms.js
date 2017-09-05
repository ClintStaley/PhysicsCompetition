var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Sbms';

router.get('/', function (req, res) {
   var num = req.query.num;
   
   req.cnn.chkQry('select * from Submits where cmpId = ? && teamId = ? ' +
      'order by subTime DESC', [req.params.cmpId,req.params.teamId],
   //function that closes cnn
   function (err, result) {
      if (num || num == 0)
         result = result.slice(0,num);
         
      res.json(result);
      
      res.status(200);
      
      req.cnn.release();
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
 
   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["content"], cb)) {
         if (vld.check(( !body.response || vld.checkAdmin()),
               Tags.forbiddenField,null,cb)) {
            body.cmpId = req.params.cmpId;
            body.teamId = req.params.teamId;
            body.subTime = new Date();
            cnn.chkQry('insert into Submits set ?', body, cb);
         }
      }
   },
   function (result, fields, cb) {
      // Return location of inserted Submissions
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.get('/:id', function (req, res) {
   var vld = req.validator;
   
   req.cnn.query('select * from Submits where id = ? && cmpId = ? && teamId = ?'
        , [req.params.id,req.params.cmpId,req.params.teamId],
   function (err, teamArr) {
      if (vld.check(teamArr.length, Tags.notFound)) {
         res.json(teamArr[0]);
      }
      req.cnn.release();
   });
});

router.put('/:id', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
   
   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["response"], cb)) {
         if (vld.checkAdmin(cb)) {
            body.cmpId = req.params.cmpId;
            body.teamId = req.params.teamId;
            body.subTime = new Date();
            cnn.chkQry('select * from Submits where id = ? && cmpId = ? &&' +
               ' teamId = ?', [req.params.id,req.params.cmpId,req.params.teamId]
               , cb);
         }
      }
   },
   function (result, err, cb) {
      if (vld.check(result && result.length , Tags.notFound, null, cb))
         cnn.query("update Submits set ? where id = ?",[req.body, req.params.id]
            ,cb);
   },
   function (result, fields, cb) {
      // Return location of inserted Submissions
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function () {
      res.status(200);
      cnn.release();
   });
});

module.exports = router;