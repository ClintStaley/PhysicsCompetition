var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('./Routes/Session');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');

var app = express();

// Static path to index.html and all clientside js
app.use(express.static(path.join(__dirname, 'public')));

// Parse request body using JSON; attach to req as req.body
app.use(bodyParser.json());

// No messing w/db ids
app.use(function (req, res, next) {
   delete req.body.id;
   next();
});

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Find relevant Session if any, and attach as req.session
app.use(Session.router);

// Attach bugs object to req
//app.use(function(req, res, next) {req.bugs = bugs; next();});

// Check general login.  If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function (req, res, next) {
   console.log("Checking login for " + req.path);
   if (req.session ||
      req.method === 'POST' && (req.path === '/Prss' || req.path === '/Ssns')) {
      req.validator = new Validator(req, res);
      next();
   } else
      res.status(401).end();
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Prss', require('./Routes/Account/Prss'));
app.use('/Ssns', require('./Routes/Account/Ssns'));
app.use('/Ctps', require('./Routes/Competition/Ctps'));
app.use('/Cmps', require('./Routes/Competition/Cmps'));
app.use('/Cmps/:cmpId/Teams', require('./Routes/Competition/Teams'));
app.use('/Cmps/:cmpId/Teams/:teamId/Sbms', require('./Routes/Competition/Sbms'));
//app.use('/Cnvs', require('./Routes/Conversation/Cnvs.js'));
//app.use('/Msgs', require('./Routes/Conversation/Msgs.js'));

// Special debugging route for /DB DELETE.  Clears all table contents, resets all
// auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function (req, res) {
   var resetTables =
         ["Person","CompetitionType","Competition","Teams","Submits"];
   
   if (!req.session.isAdmin()) { //&& !req.bugs.nonAdminDBDel) {
      req.cnn.release();
      res.status(403).end();
      return;
   }
   
   // Callbacks to clear tables
   var cbs = resetTables.map(function (tblName) {
      return function (cb) {
         req.cnn.query("delete from " + tblName, cb);
      };
   });
   
   // Callbacks to reset increment bases
   cbs = cbs.concat(resetTables.map(function (tblName) {
      return function (cb) {
         req.cnn.query("alter table " + tblName + " auto_increment = 1", cb);
      };
   }));
   
   // Callback to reinsert admin user
   cbs.push(function (cb) {
      req.cnn.query('INSERT INTO Person (firstName, lastName, email,' +
         ' password, whenRegistered, role) VALUES ' +
         '("Joe", "Admin", "adm@11.com","password", NOW(), 1);', cb);
   });
   
   // Callback to clear sessions, release connection and return result
   cbs.push(function (callback) {
      for (var session in Session.sessions)
         delete Session.sessions[session];
      callback();
   });
   
   async.series(cbs, function (err) {
      req.cnn.release();
      if (err)
         res.status(400).json(err);
      else
         res.status(200).end();
   });
});

// Handler of last resort.  Send a 404 response and release connection
app.use(function (req, res) {
   res.status(404).end();
   //if (!bugs.no404Release)
   req.cnn.release();
});

// General error handler.  Send 500 and error body
app.use(function (err, req, res, next) {
   res.status(500).json(err);
   req.cnn && req.cnn.release();
});

var port = (function () {
   var p = 3000;
   var idx = process.argv.indexOf('-p') + 1;
   
   if (idx > 0 && idx < process.argv.length) {
      p = parseInt(process.argv[idx]) || p;
   }
   
   return p;
})();

app.listen(port, function () {
   console.log('App Listening on port ' + port);
});
