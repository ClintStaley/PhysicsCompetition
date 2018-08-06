var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams/:teamId/Sbms';

router.get('/', (req, res) => {
   var num = req.query.num;

   req.cnn.chkQry('select * from Submit where cmpId = ? && teamId = ?' +
    ' order by sbmTime DESC',
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
            body.sbmTime = new Date();
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

   req.cnn.query('select * from Submit where id = ? && cmpId = ? && teamId = ?',
    [req.params.id,req.params.cmpId,req.params.teamId],
   (submission, submissionGet) => {
      if (vld.check(submissionGet.length, Tags.notFound)) {
         res.json(submissionGet[0]);
      }
      req.cnn.release();
   });
});

router.put('/:id', (req, res) => {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;
   var cmpId = req.params.cmpId;
   var teamId = req.params.teamId;
   var smbId = req.params.id;
   console.log("Pre-Waterfall");
   console.log(body);
   async.waterfall([
   (cb) => {
     console.log("Waterfall 1");
      if (vld.hasOnlyFields(body, ["response", "score"], cb)) {
         if (vld.checkAdmin(cb)) {
            cnn.chkQry('select * from Team where id = ? && cmpId = ?',
             [ teamId, cmpId ], cb);
         }
      }
   },
   (team, err, cb) => {
     console.log("Waterfall 2");
      var teamBody = {};
      if (vld.check(team && team.length, Tags.notFound, cb)) {
        if (team[0].bestScore < body.score) {
           teamBody.bestScore = body.score;
           cnn.chkQry("update Team set ? where id = ?",
            [ teamBody, teamId ], cb);
        }
        else
           cb(null, null, cb);
      }
   },
   (result, err, cb) => {
     console.log("Waterfall 3");
      body.cmpId = cmpId;
      body.teamId = teamId;
      body.sbmTime = new Date();
      cnn.chkQry('select * from Submit where id = ? && cmpId = ? && ' +
       'teamId = ?',
       [smbId, cmpId, teamId], cb);
   },
   (submission, err, cb) => {
     console.log("Waterfall 4");
      if (vld.check(submission && submission.length, Tags.notFound, cb))
         cnn.chkQry("update Submit set ? where id = ?",
          [req.body, req.params.id], cb);
   },
   (result, fields, cb) => {
     console.log("Waterfall 5");
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
