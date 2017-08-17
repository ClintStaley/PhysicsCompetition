var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Sbms';

router.get('/', function (req, res) {
   
   req.cnn.chkQry('select * from Submits where cmpId = ? && teamId = ?'
         , [req.params.cmpId,req.params.teamId],
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
            if (vld.hasFields(body, ["content"], cb)) {
               body.cmpId = req.params.cmpId;
               body.teamId = req.params.teamId;
               body.subTime = new Date();
               cnn.chkQry('insert into Submits set ?', body, cb);
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
   
   req.cnn.query('select * from Submits where id = ? && cmpId = ? && teamId = ?'
        , [req.params.id,req.params.cmpId,req.params.teamId],
   function (err, teamArr) {
      if (vld.check(teamArr.length, Tags.notFound)) {
         res.json(teamArr);
      }
      req.cnn.release();
   });
});

module.exports = router;