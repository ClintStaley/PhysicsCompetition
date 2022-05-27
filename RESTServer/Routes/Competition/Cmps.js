var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var Ajv = require('ajv');
var async = require('async');

var titleLimit = 150;
router.baseURL = '/Cmps';

router.get('/', (req, res) => {
   var email = req.query.email;
   var ctpId = req.query.CompetitionType;
   var cnn = req.cnn;
   var query = 'select Competition.id, ownerId, ctpId, title, prms, rules, hints,' +
      ' description from Competition';
   var fillers = [];

console.log('In get');
   if (email) {
      query = 'select Competition.id, ownerId, ctpId, title, prms, rules, hints, ' +
         'description from Competition,Person where email = ? && ' +
         'Competition.ownerId = Person.id';
      fillers.push(email);
      if (ctpId) {
         query = query + ' && ctpId = ?';
         fillers.push(ctpId);
      }
   }
   else if (ctpId) {
      query = query + ' where ctpId = ?';
      fillers.push(ctpId);
   }

   async.waterfall([
      (cb) => {
console.log(`Running ${query}`);
         cnn.chkQry(query, fillers, cb);
      },
      (cmps, fields, cb) => {
         res.json(cmps);
         res.status(200);
         cb();
      }
      ],
      () => {
console.log('oops');
         cnn.release();
      });
});

router.post('/', (req, res) => {
   var vld = req.validator;  // Shorthands
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   var ajv = new Ajv(); //schema validator
   var schemaVld = {};

   if (vld.checkAdmin())
      async.waterfall([
         (cb) => {
            //Get dupTitles if they exist
            if (vld.hasOnlyFields(body, ["title", "ctpId", "prms", "rules",
             "hints", "description"], cb).check(true,null,cb)
             && vld.checkFieldLengths(body, ["title"], [titleLimit])) {
               body.ownerId = ssn.prsId;
               cnn.chkQry(
                  'select * from Competition where title = ? and ownerId = ?',
                  [body.title, body.ownerId], cb);
            }
         },
         (cmp, fields, cb) => {
            if (vld.check(!cmp.length, Tags.dupTitle, cb)) {
               // Get Ctp info
               cnn.chkQry('select * from CompetitionType where id = ?',
                  body.ctpId, cb);
            }
         },
         (ctp, fields, cb) => {
            // If ctp exists, check schema
            if (vld.check(ctp && ctp.length, Tags.noCompType, cb)) {
               try {
                  schemaVld = ajv.compile(JSON.parse(ctp[0].prmSchema));
                  var valid = schemaVld(JSON.parse(body.prms));
                  if (vld.check(valid, [Tags.invalidPrms,
                      schemaVld.errors], cb))
                     cnn.chkQry('insert into Competition set ?', body, cb);
               }
               catch (exception) {
                  vld.check(false, [Tags.invalidPrms, ], cb);
               }
            }
         },
         (result, fields, cb) => {
            // Return location of inserted competition
            res.location(router.baseURL + '/' + result.insertId).end();
            cb();
         }],
         () => {
            cnn.release();
         });
   else
      cnn.release();
});

router.get('/:id', (req, res) => {
   var vld = req.validator;

   req.cnn.query('select id, ownerId, ctpId, title, prms, rules, hints, ' +
      'description from Competition where id = ?', [req.params.id],
      (err, cmp) => {
         if (vld.check(cmp.length, Tags.notFound)) {
            res.json(cmp[0]);
         }
         req.cnn.release();
      });
});

router.put('/:id', (req, res) => {
   var vld = req.validator;
   var ssn = req.session;
   var body = req.body;
   var cnn = req.cnn;
   var cmpTp;
   var titleLimit = 150;
   var ajv = new Ajv();
   async.waterfall([
      (cb) => {
         if (vld.hasOnlyFields(body, ["title", "ctpId", "prms", "rules", "hints",
            "description"]) && vld.checkFieldLengths(body, ["title"], [titleLimit]))
            cnn.query("select * from Competition where id = ?",
               [req.params.id], cb);
      },
      (cmp, fields, cb) => {
         if (vld.check(cmp && cmp.length, Tags.notFound, cb) &&
            vld.checkPrsOK(cmp[0].ownerId, cb)) {
            cmpTp = cmp[0].ctpId;
            if (body.title)
               cnn.chkQry(
                  "select * from Competition where title = ? and ownerId = ?",
                  [body.title, ssn.id], cb);
            else
               cb(null, null, cb);
         }
      },
      (cmpTitle, fields, cb) => {
         if (!body.title || vld.check(!cmpTitle.length, Tags.dupTitle, cb))
            if (body.prms)
               async.waterfall([
                  (cb) => {
                     cnn.chkQry("select * from CompetitionType where id = ?",
                        [cmpTp], cb);
                  }],
                  (fields, ctp) => {
                     if (vld.check(ctp && ctp.length, Tags.notFound, cb))
                        try {
                           var schemaVld = ajv.compile(JSON.parse(ctp[0].prmSchema));
                           var valid = schemaVld(JSON.parse(body.prms));
                           if (vld.check(valid, [Tags.invalidPrms, 
                            schemaVld.errors], cb))
                              cnn.chkQry("update Competition set ? where id = ?",
                                 [req.body, req.params.id], cb);
                        }
                        catch (exception) {
                           vld.check(false, Tags.badBodyFormat, cb);
                        }
                  });
            else
               cnn.chkQry("update Competition set ? where id = ?",
                  [req.body, req.params.id], cb);
      },
      (result, fields, cb) => {
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

   if (vld.checkAdmin()) {
      cnn.chkQry('delete from Competition where id = ?', [req.params.id],
         (err, result) => {
            if (!err && vld.check(result.affectedRows, Tags.notFound))
               res.status(200).end();
            cnn.release();
         });
   }
   else {
      cnn.release();
   }
});

router.get('/:id/WaitingSbms', (req, res) => {
   var vld = req.validator;
   var cnn = req.cnn;
   var num = req.query.num;

   if (vld.checkAdmin()) {
      cnn.chkQry('select s.*, t.numSubmits, t.lastSubmit, t.bestScore from ' +
         'Submit s, Team t where t.id = s.teamId and s.cmpId = ? and ' +
         '( testResult is null or not errorResult is null) order by sbmTime DESC',
         [req.params.id],
         (err, result) => {
            if (result.length)
               if (num || num == 0)
                  result = result.slice(0, num);
            res.json(result);
            cnn.release();
         });
   }
   else {
      cnn.release();
   }
});

module.exports = router;
