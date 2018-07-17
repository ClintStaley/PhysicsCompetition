var mysql = require('mysql');
var Validator = require('./Validator.js');

// Constructor for DB connection pool
var CnnPool = function () {
    var poolCfg = require('./connection.json');
    var argvDbIdx;

    poolCfg.connectionLimit = CnnPool.PoolSize;

    // See if we are supposed to use an argv-specified DB
    argvDbIdx = process.argv.indexOf('-db') + 1;
    if (argvDbIdx > 0 && argvDbIdx < process.argv.length) {
        poolCfg.database = process.argv[argvDbIdx];
    }

    this.pool = mysql.createPool(poolCfg);
};

CnnPool.PoolSize = 4;

// Conventional getConnection, drawing from the pool
CnnPool.prototype.getConnection = function (cb) {
    this.pool.getConnection(cb);
};

// Router function for use in auto-creating CnnPool for a request
CnnPool.router = function (req, res, next) {
    console.log("Getting connection");
    //console.log(poolCfg.user);
    CnnPool.singleton.getConnection(function (err, cnn) {
        if (err)
            res.status(500).json('Failed to get connection: ' + err);
        else {
            console.log("Connection acquired");
            cnn.chkQry = function (qry, prms, cb) {
                // Run real qry, checking for error
                this.query(qry, prms, function (err, rsp, fields) {
                    if (err)
                        res.status(500).json('Failed query ' + qry);
                    cb(err, rsp, fields);
                });
            };
            req.cnn = cnn;
            next();
        }
    });
};

// The one (and probably only) CnnPool object needed for the app
CnnPool.singleton = new CnnPool();

module.exports = CnnPool;
