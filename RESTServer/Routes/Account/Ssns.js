var Express = require('express');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.get('/', function (req, res) {
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

router.post('/', function (req, res) {
   var cookie;
   var cnn = req.cnn;
   
   cnn.chkQry('select * from Person where email = ?', [req.body.email],
      function (err, result) {
         if (req.validator.check(result.length && result[0].password ===
               req.body.password, Tags.badLogin)) {
            cookie = ssnUtil.makeSession(result[0], res);
            console.log("Logging in " + req.body.email);
            res.location(router.baseURL + '/' + cookie).status(200).end();
         }
         cnn.release();
      });
});

router.delete('/:cookie', function (req, res) {
   var ssnExists;
   
   if (req.validator.check(req.params.cookie === req.cookies[ssnUtil.cookieName]
         || req.session.isAdmin(), Tags.noPermission)) {
      ssnExists = ssnUtil.deleteSession(req.params.cookie);
      res.status(ssnExists ? 200 : 400).end();
   }
   req.cnn.release();
});

router.get('/:cookie', function (req, res) {
   var cookie = req.badCookieGet ? undefined : req.params.cookie;
   var vld = req.validator;
   var ssn = ssnUtil.sessions[cookie];
   
   if (vld.check(ssn, Tags.notFound) && vld.checkPrsOK(ssn.id)) {
      res.status(200).json({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
   }
   req.cnn.release();
});

module.exports = router;
