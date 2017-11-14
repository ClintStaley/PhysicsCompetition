var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var validate = require('commonjs-utils/lib/json-schema').validate;
var async = require('async');

router.baseURL = '/Cmps';

router.get('/', function (req, res) {
   var email = req.query.email;
   var CtpId = req.query.CompetitionType;
   var cnn = req.cnn;
   var query = 'select Competition.id,ownerId,ctpId,title,prms,rules' +
      ' from Competition';
   var fillers = [];

   if (email) {
      query = 'select Competition.id,ownerId,ctpId,title,prms,rules from ' +
         'Competition,Person where email = ? && ' +
         'Competition.ownerId = Person.id';
      fillers.push(email);
      if (CtpId) {
         query = query + ' && ctpId = ?';
         fillers.push(CtpId);
      }
   }
   else if (CtpId) {
      query = query + ' where ctpId = ?';
      fillers.push(CtpId);
   }

   async.waterfall([
   function (cb) {
      cnn.chkQry(query, fillers, cb);
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

   if (vld.checkAdmin())
      async.waterfall([
      function (cb) {
         //Get dupTitles if they exist
         if (vld.hasOnlyFields(body, ["title", "ctpId", "prms", "rules"], cb)) {
            body.ownerId = ssn.id;
            cnn.chkQry(
               'select * from Competition where title = ? and ownerId = ?',
               [body.title, body.ownerId], cb);
         }
      },
      function (existingCmp, fields, cb) {
         //check dupTitle
         if (vld.check(!existingCmp.length, Tags.dupTitle, null, cb)) {
            // get the prmSchema from Ctp
            cnn.chkQry('select * from CompetitionType where id = ?',
               body.ctpId, cb);
         }
      },
      function (Ctp, fields, cb) {
         // If no duplicates, insert new competition
         if (vld.check(Ctp && Ctp.length, Tags.NoCompType, null, cb)) {
            try {
               var validation = validate(JSON.parse(body.prms),
                  JSON.parse(Ctp[0].prmSchema));
               if (vld.check(validation.valid, Tags.NoCompType, null, cb))
                  cnn.chkQry('insert into Competition set ?', body, cb);
            }
            catch (exception) {
               vld.check(false, "no JSON", null, cb);
            }
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

   req.cnn.query('select Competition.id,ownerId,ctpId,title,prms,rules from ' +
      'Competition where id = ?', [req.params.id],
      function (err, cmpArr) {
         if (vld.check(cmpArr.length, Tags.notFound)) {
            res.json(cmpArr[0]);
         }
         req.cnn.release();
      });
});

router.put('/:id', function (req, res) {
   var vld = req.validator;
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   var cmpTp;

   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["title", "prms"]))
         cnn.query("select * from Competition where id = ?",
            [req.params.id], cb);
   },
   function (qRes, fields, cb) {
      if (vld.check(qRes && qRes.length, Tags.notFound, null, cb) &&
         vld.checkPrsOK(qRes[0].ownerId, cb)) {
         cmpTp = qRes[0].ctpId;
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
         if (body.prms)
            async.waterfall([
            function (cb) {
               cnn.chkQry(
                  "select * from CompetitionType where id = ?",
                  [cmpTp], cb);
            }],
            function (fields, Ctp) {
               if (vld.check(Ctp && Ctp.length, Tags.notFound, null, cb))
                  try {
                     var validation = validate(JSON.parse(body.prms),
                        JSON.parse(Ctp[0].prmSchema));
                     if (vld.check(validation.valid, Tags.InvalidPrms, null, cb))
                        cnn.chkQry("update Competition set ? where id = ?",
                           [req.body, req.params.id], cb);
                  }
                  catch (exception) {
                     vld.check(false, "no JSON", null, cb);
                  }
            });
         else
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

router.get('/:id/WaitingSbms', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var num = req.query.num;

   if (vld.checkAdmin()) {
      cnn.query('select id,teamId,content,response,score,subTime from Submit' +
         ' where cmpId = ? and response is null order by subTime DESC',
         [req.params.id],
      function (err, result) {
         if (result.length) {
            if (num || num == 0)
               result = result.slice(0, num);
         }
         res.json(result);
         cnn.release();
      });
   }
   else {
      cnn.release();
   }
});

module.exports = router;
