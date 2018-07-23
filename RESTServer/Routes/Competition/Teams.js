var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true ,mergeParams: true});
var async = require('async');

router.baseURL = '/Cmps/:cmpId/Teams';

router.get('/', (req, res) => {

   req.cnn.chkQry('select id,teamName,bestScore,lastSubmit,CanSubmit from Team where cmpId = ?', req.params.cmpId,
   (err, result) => {
      res.json(result);
      res.status(200);
      req.cnn.release();
   });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   var memberData = [];
   var curTeam;
   var rules;

   async.waterfall([
   (cb) => {
      //check for required field teamName
      if (vld.hasFields(body, ["teamName"], cb)) {
         body.ownerId = ssn.id;
         body.cmpId = req.params.cmpId;
         //Check teamName availability
         cnn.chkQry('select * from Team where teamName = ? and cmpId = ?',
          [body.teamName, body.cmpId ], cb);
      }
   },
   (existingTm, fields, cb) => {
      // If no duplicates, check the cmp rules
      if (vld.check(!existingTm.length, Tags.dupTitle, cb)) {
         cnn.chkQry('select * from Competition where id = ?', body.cmpId, cb);
      }
   },
   (Cmp, fields, cb) => {
      // save rules and the current team for future use
      //create new team
      if (vld.check(Cmp && Cmp.length, Tags.notFound, cb)) {
         rules = Cmp[0].rules;
         curTeam = Cmp[0].curTeam;
         cnn.chkQry('insert into Team set ?', body, cb);
      }
   },
   (result, fields, cb) => {
      // Return location of inserted Team
      res.location(router.baseURL + '/' + result.teamId);

      //save team data to include team leader as a member in member table
      memberData.prsId = body.ownerId;
      memberData.teamId = result.insertId;

      if (rules) {
         //variable used to update created team
         var nextTeam;
         var canSubmit;
         async.waterfall([
         (cb) => {
            //checks if there is a team that is ok to go
            if (curTeam) {
               //makes the recently created team the last team to go
               nextTeam = curTeam;
               canSubmit = false;
               cnn.chkQry('update Team set nextTeam = ? where nextTeam = ?',
                [result.insertId, curTeam], cb);
            }
            else {
               //makes the team just created the current team
               nextTeam = result.insertId;
               canSubmit = true;
               cnn.chkQry('update Competition set curTeam = ? where id = ?',
                [result.insertId, body.cmpId], cb);
            }
         }],
         () => {
            //updates team so that the canSubmit and nextTeam values are correct
            cnn.chkQry('update Team set nextTeam = ?, canSubmit = ? ' +
             'where id = ?', [nextTeam, canSubmit, result.insertId],cb);
         });
      }
      else{
         //if the cmp has standard rules
         cb(null, null, cb);
      }
   },
   (res, fields, cb) => {
      //put team leader into member
   cnn.chkQry('insert into Membership set prsId = ?, teamId = ?',
    [memberData.prsId, memberData.teamId], cb);
   }],
   () => {
      res.end();
      cnn.release();
   });
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   req.cnn.query('select id,teamName,bestScore,lastSubmit,canSubmit from' +
    ' Team where id = ? && cmpId = ?',
    [req.params.id,req.params.cmpId],
   (err, teamArr) => {
      if (vld.check(teamArr.length, Tags.notFound)) {
         res.json(teamArr[0]);
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
      if (vld.hasOnlyFields(body, ["teamName", "ownerId"]))
         cnn.chkQry("select * from Team where id = ? && cmpId = ?",
          [req.params.id, req.params.cmpId], cb);
   },
   (qRes, fields, cb) => {
      if (vld.check(qRes.length, Tags.notFound, cb)) {
         if (body.teamName && vld.checkPrsOK(qRes[0].ownerId,cb))
            cnn.chkQry("select * from Team where teamName = ? && cmpId = ?",
             [body.teamName,req.params.cmpId], cb);
      }
   },
   (nameRes, fields, cb) => {
      if (!body.teamName ||
       vld.check(nameRes  && !nameRes.length, Tags.dupTitle, cb))
         cnn.chkQry("update Team set ? where id = ?",
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
   var cnn = req.cnn;
   var nextTeam;
   var otherTeams;

   async.waterfall([
   (cb) => {
      //get data on the correct team
      cnn.chkQry('select * from Team where id = ?',
       [req.params.id], cb);
   },
   (result, fields, cb) => {
      //checks teh team exists
      if (vld.check(result && result.length, Tags.notFound, cb))
         if (vld.checkPrsOK(result[0].ownerId, cb)) {
            nextTeam = result[0].nextTeam;
            otherTeams = !(nextTeam == req.params.id);
            cnn.query('select * from Competition where id = ?',
             [req.params.cmpId], cb);
         }
   },
   (Cmp, fields, cb) => {
      //checks teh competition rules, or if the cutTeam pointer needs to change
      if (!Cmp[0].rules || !(Cmp[0].curTeam == req.params.id))
         cb(null, null, cb);
      else if (!otherTeams) //checks if the curTeam needs to be null
         cnn.chkQry('update Competition set curTeam = ? where id = ?',
          [null, Cmp[0].id], cb);
      else
         cnn.chkQry('update Competition set curTeam = ? where id = ?',
          [nextTeam, Cmp[0].id], cb);
   },
   (updRes, fields, cb) => {
      //if there are other teams update the team pointing ot the now deleted team
      if (otherTeams){
         cnn.chkQry('update Team set nextTeam = ? where nextTeam = ?',
          [nextTeam, req.params.id], cb);
      }
      else
         cb(null,null,cb);
   },
   (updRes, fields, cb) => {
      //delete the team
      req.cnn.query('delete from Team where id = ? && cmpId = ?',
       [req.params.id, req.params.cmpId], cb);
   }],
   (err, result) => {
      if (!err && vld.check(result.affectedRows, Tags.notFound))
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;
