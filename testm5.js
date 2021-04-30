

console.log(require("crypto").createHash('sha1').update(process.argv[2]).digest('hex'));

