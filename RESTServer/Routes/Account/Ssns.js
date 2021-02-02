var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var crypto = require("crypto");

router.baseURL = '/Ssns';

router.get('/', (req, res) => {
   var body = [], ssn;

   if (req.validator.checkAdmin()) {
      for (var cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         body.push({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
      }
      res.status(200).json(body);
   }
   req.cnn.release();
});

router.post('/', (req, res) => {
   var cookie;
   var cnn = req.cnn;
   var body = req.body;

   if (body.password)
      body.password =
       crypto.createHash('sha1').update(body.password).digest('hex');
   cnn.chkQry('select * from Person where email = ?', [body.email],
      (err, result) => {
         if (req.validator.check(result.length && result[0].password ===
          body.password, Tags.badLogin)) {
            cookie = ssnUtil.makeSession(result[0], res);
            res.location(router.baseURL + '/' + cookie).status(200).end();
         }
         cnn.release();
      });
});

router.delete('/:cookie', (req, res) => {
   var ssnExists;

   if (req.validator.check(req.params.cookie === req.cookies[ssnUtil.cookieName]
    || req.session.isAdmin(), Tags.noPermission)) {
      ssnExists = ssnUtil.deleteSession(req.params.cookie);
      res.status(ssnExists ? 200 : 400).end();
   }
   req.cnn.release();
});

router.get('/:cookie', (req, res) => {
   var cookie = req.badCookieGet ? undefined : req.params.cookie;
   var vld = req.validator;
   var ssn = ssnUtil.sessions[cookie];

   if (vld.check(ssn, Tags.notFound) && vld.checkPrsOK(ssn.id)) {
      res.status(200).json({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
   }
   req.cnn.release();
});

module.exports = router;
