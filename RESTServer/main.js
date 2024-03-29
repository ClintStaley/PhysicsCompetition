var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');
var schemas = require('./schemas.json');

let server;  // Global server object

// Configure app with HTTP routes.  If corsDomain is nonNull, add CORS
// permissions for that domain/port.  If testFlag, add special routes for
// testing, e.g. database refresh.
var configApp = (corsDomain, testFlag) => {
   var app = express();

   // Enable CORS for web app on different host or port, as given by corsDomain
   if (corsDomain) {
      console.log(`Enabling cross-origin access from ${corsDomain}`)
      app.use(function (req, res, next) {
         res.header("Access-Control-Allow-Origin", `http://${corsDomain}`);
         res.header("Access-Control-Allow-Credentials", true);
         res.header("Access-Control-Allow-Headers", "Content-Type");
         res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
         res.header("Access-Control-Expose-Headers", "Content-Type, Location");
         next();
      });
   }

   // No further processing needed for options calls.

   app.options("/*", function (req, res) {
      res.status(200).end();
   });

   // Parse request body using JSON; attach to req as req.body
   app.use(bodyParser.json());   
   
   // Debug utility
   app.use((req, res, next) => {
      console.log(`${req.method} to ${req.path}`);
      next();
   });

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
      if (req.session ||
         req.method === 'POST' && (req.path === '/Prss' || req.path === '/Ssns')) {
         req.validator = new Validator(req, res);
         next();
      } else{
         res.status(401).end();
      }
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

   if (testFlag)
      addDebugRoutes(app);

   return app;
}

var addDebugRoutes = app => {
   console.log('Setting test routes');
   app.delete('/Server', function(req, res) {process.exit(0);});

   // Debugging tool. Clear all table contents, reset all auto_increment
   // keys to 1, and reinsert one admin user.
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
            '("Joe", "Admin", "admin@softwareinventions.com","' +
            require("crypto").createHash('sha1').update("password").digest('hex') +
            '", NOW(), 1);', cb);
      });

      // Callback to reinsert Land Grab CompetitionType
      cbs.push(function (cb) {

         var schema = JSON.stringify(schemas.LandGrab);

         req.cnn.query(`insert into CompetitionType (title, description,
          codeName, prmSchema)  VALUES ("Land Grab", "Claim territory
          by placing circles in a field of obstacles", "LandGrab",
          '${schema}');`, cb);
      });

      // Callback to reinsert Bounce CompetitionType
      cbs.push(function (cb) {

         var schema = JSON.stringify(schemas.Bounce);

         req.cnn.query(
            `insert into CompetitionType (title, description, codeName, ` +
            `prmSchema)
            VALUES ("Bounce", "Bounce a ball across platforms", "Bounce",
            '${schema}');`, cb);
      });

      // Callback to clear sessions, release connection and return result
      cbs.push(function (callback) {
         Session.resetAll();
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
};

// Main server program.  Run thus:
//
// node main.js [-p httpPort [httpsPort]] [-h] [-c corsDomain]
//
// -h -- Run http only
// -p httpPort [httpsPort]  Set http and optionally https ports.  Default to 80 and 443
// -c corsDomain -- Enable CORS on https://corsDomain:httpPort.  Defaults to localhost

(function (argv) {
   var httpPort = 4005;
   var httpsPort = 443;
   var corsDomain;
   var portFlag = argv.indexOf('-p');
   var corsFlag = argv.indexOf('-c');

   // If port flag exists with sufficient args after it
   if (portFlag !== -1 && portFlag + 1 < argv.length)
      httpPort = parseInt(argv[portFlag + 1]);

   // If special CORS domain is indicated, use it, else stick w/ localhost
   if (corsFlag !== -1 && corsFlag + 1 < argv.length)
      corsDomain = argv[corsFlag + 1];

   app = configApp(corsDomain, process.argv.indexOf('-test') !== -1);

   server = http.createServer(app)
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


      server = https.createServer(certOptions, app)
       .listen(httpsPort, () => console.log(`Https listening on ${httpsPort}`));
   }
})(process.argv);
