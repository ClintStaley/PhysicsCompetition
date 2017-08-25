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

//WORK IN PROGRESS
router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
   console.log("1");
   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["content","response"], cb)) {
         console.log("2");
         
         //WEIRD
         if (vld.check(( vld.isAdmin() || !body.response),Tags.forbiddenField,null,cb)) {
            console.log("3");
            body.cmpId = req.params.cmpId;
            body.teamId = req.params.teamId;
            body.subTime = new Date();
            cnn.chkQry('insert into Submits set ?', body, cb);
         }
      }
   },
   function (result, fields, cb) {
      console.log("4");
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
         res.json(teamArr);
      }
      req.cnn.release();
   });
});

module.exports = router;