var Express = require('express');
var Tags = require('../Validator.js').Tags;
var Session = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var crypto = require("crypto");

router.baseURL = '/Ssns';

router.get('/', (req, res) => {
   var body = [], ssn;

   if (req.validator.checkAdmin()) {
      for (var id of Session.getAllIds()) {
         ssn = Session.ssnsById[id];
         if (ssn)
            body.push({prsId: ssn.prsId, loginTime: ssn.loginTime});
      }
      res.status(200).json(body);
   }
   req.cnn.release();
});

router.post('/', (req, res) => {
   var ssn;
   var cnn = req.cnn;
   var body = req.body;

   if (body.password)
      body.password =
       crypto.createHash('sha1').update(body.password).digest('hex');

   cnn.chkQry('select * from Person where email = ?', [body.email],
   (err, result) => {
      if (req.validator.check(result.length && result[0].password ===
       body.password, Tags.badLogin)) {
         ssn = new Session(result[0], res);
         res.location(router.baseURL + '/' + ssn.id).status(200).end();
      }
      cnn.release();
   });
});

router.delete('/:ssnId', function(req, res) {
   var vld = req.validator;
   var trgSsn = Session.findById(req.params.ssnId);

   if (vld.check(trgSsn, Tags.notFound) && vld.checkPrsOK(trgSsn.prsId))  {
      trgSsn.logOut();
      res.status(200).end();
   }

   req.cnn.release();
});

router.get('/:id', function(req, res) {
   var vld = req.validator;
   var trgSsn = Session.findById(req.params.id);

   if (vld.check(trgSsn, Tags.notFound) && vld.checkPrsOK(trgSsn.prsId)) {
      res.status(200).json(
       {id: trgSsn.id, prsId: trgSsn.prsId, loginTime: trgSsn.loginTime});
   }

   req.cnn.release();
});

module.exports = router;