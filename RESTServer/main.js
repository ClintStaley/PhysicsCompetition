var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('./Routes/Session');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');

var app = express();

// Manage CORS POS.
//change this back later
app.use(function(req, res, next) {
   console.log("Handling " + req.path + '/' + req.method);
   //"http://localhost:8080");
   //"http://www.softwareinventions.com:8080");
   res.header("Access-Control-Allow-Origin", "http://localhost:3001");
   res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Headers", "Content-Type");
   res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
   res.header("Access-Control-Expose-Headers", "Content-Type, Location");
   next();
});

// No further processing needed for options calls.
app.options("/*", function(req, res) {
   res.status(200).end();
});

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
app.use('/Cmps/:cmpId/Teams/:teamId/Mmbs',
require('./Routes/Competition/Mmbs'));

// Debugging tool. Clear all table contents, reset all auto_increment
// keys to 1, and reinsert one admin user.
if (process.argv.indexOf('-testing') !== -1)
app.delete('/DB', function (req, res) {
   var resetTables = ["Person", "CompetitionType", "Competition",
    "Team", "Submit", "Membership"];
   if (!req.session.isAdmin()) {
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
         '("Joe", "Admin", "adm@11.com","' +
         require("crypto").createHash('md5').update("password").digest('hex') +
         '", NOW(), 1);', cb);
   });

   // Callback to reinsert Bounce CompetitionType TEST


   // Callback to reinsert Land Grab CompetitionType
   cbs.push(function (cb) {
      req.cnn.query(`insert into CompetitionType (title, description, codeName,
        tutorial, prmSchema)  VALUES ("Land Grab", "Claim territory by
        placing circles in a field of obstacles", "LandGrab",
        "Claim territory by placing circles in a field of obstacles...", '{
     "$schema": "http://json-schema.org/draft-07/schema#",

     "title": "Land Grab",
     "type": "object",

     "properties": {
        "numCircles": {
           "title": "Number of circles allowed per team",
           "type": "integer",
           "minimum": 1
        },
        "goalArea": {
           "title": "Area of coverage that gets 100%",
           "type": "number",
           "minimum": 0.0,
           "maximum": 10000.0
        },
        "obstacles": {
           "title": "Blocked areas in 100x100 square",
           "type": "array",
           "items": {
              "title": "Blocked rectangle",
              "type": "object",
              "properties": {
                 "loX": {
                    "title": "Left edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "hiX": {
                    "title": "Right edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "loY": {
                    "title": "Bottom edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "hiY": {
                    "title": "Top edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 }
              },
              "additionalProperties": false,
    		  "minProperties": 4
           }
        }
    },
    "additionalProperties": false,
    "minProperties": 3
}');`, cb);
});

   // Callback to reinsert Bounce CompetitionType
   cbs.push(function (cb) {
      req.cnn.query(
   `insert into CompetitionType (title, description, codeName, tutorial, prmSchema)
    VALUES ("Bounce", "Bounce a ball across platforms", "Bounce",
   " a ball across platforms by inputing a speed",
   '{
     "$schema": "http://json-schema.org/draft-07/schema#",

     "title": "Bounce",
     "type": "object",

     "properties": {
        "targetTime": {
           "title": "time to get all platforms that will get 100",
           "type": "number"
        },
        "obstacles": {
           "title": "platforms to bounce off of",
           "type": "array",
           "items": {
              "title": "Blocked rectangle",
              "type": "object",
              "properties": {
                 "loX": {
                    "title": "Left edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "hiX": {
                    "title": "Right edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "loY": {
                    "title": "top edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 },
                 "hiY": {
                    "title": "bottom edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                 }
              },
   	     "additionalProperties": false,
 	     "minProperties": 4

           }
        }
    },
    "additionalProperties": false,
    "minProperties": 1
 }');`
   , cb);
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
   req.cnn.release();
});

// General error handler.  Send 500 and error body
app.use(function (err, req, res, next) {
   console.log(err);
   res.status(500).json(err.stack);
   req.cnn && req.cnn.release();
});

(function(argv) { // Main program to start server
   var httpPort = 80;
   var httpsPort = 443;
   var portFlag = argv.indexOf('-p');

   // If port flag exists with sufficient args after it
   if (portFlag !== -1 && portFlag + 1 < argv.length)
      httpPort = parseInt(argv[portFlag + 1]);

   http.createServer(app)
    .listen(httpPort, () => console.log(`Http listening on ${httpPort}`));

   // If not HttpOnly
   if (argv.indexOf('-h') === -1) {
      let certOptions = {
         ca: fs.readFileSync('certs/www_softwareinventions_com.ca-bundle'),
         cert: fs.readFileSync('certs/www_softwareinventions_com.crt'),
         key: fs.readFileSync('certs/www_softwareinventions_com.pem')
      };

      if (portFlag !== -1 && portFlag + 2 < argv.length)
         httpsPort = parseInt(argv[portFlag + 2]);

      https.createServer(certOptions, app)
       .listen(httpsPort, () => console.log(`Https listening on ${httpsPort}`));
   }
})(process.argv);
