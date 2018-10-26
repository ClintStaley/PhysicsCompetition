var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');

var certOptions = {
   ca: fs.readFileSync('certs/www_softwareinventions_com.ca-bundle'),
   cert: fs.readFileSync('certs/www_softwareinventions_com.crt'),
   key: fs.readFileSync('certs/www_softwareinventions_com.pem')
};

https.createServer(certOptions, function(req, res) {
   res.writeHead(200);
   res.end("Hi");
}).listen(8443, () => console.log("Listening on 8443"));
