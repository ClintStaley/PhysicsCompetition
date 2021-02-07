// Create a validator that draws its session from |req|, and reports
// errors on |res|
var Validator = function (req, res) {
   this.errors = [];   // Array of error objects having tag and params
   this.session = req.session;
   this.res = res;
};

// List of errors, and their corresponding resource string tags
Validator.Tags = {
   noPermission: "noPermission",    // Login lacks permission (engenders 403 code).
   missingField: "missingField",    // Field named by params[0] is missing
   badValue: "badValue",            // Field named by params[0] has bad value.
   notFound: "notFound",            // Entity not present in DB
   badLogin: "badLogin",            // Email/password combination invalid
   dupEmail: "dupEmail",            // Email duplicates an existing email
   noTerms: "noTerms",              // Acceptance of terms is required.
   noOldPwd: "noOldPwd",            // Password change requires old password
   oldPwdMismatch: "oldPwdMismatch",// Old password doesn't match
   dupTitle: "dupTitle",            // Title duplicates an existing title
   dupEnrollment: "dupEnrollment",  // Duplicate enrollment
   forbiddenField: "forbiddenField",// Field in body not allowed
   badBodyFormat: "badBodyFormat",  // Body didn't parse as JSON
   cantRemoveLeader: "cantRemoveLeader",    // Team leader is required
   noCompType: "noCompType",        //cant fint competition type
   invalidPrms: "invalidPrms",      //prms in competition doesn't pass prm schema
   badTeamLead: "badTeamLead"       //user isnt in team
};

// Check |test|.  If false, add an error with tag and possibly related
// parameters, e.g. name of missing field if tag is Tags.missingField.
// Parameter |err| is either a single error tag, or an array comprising
// an error tag followed by parameters.
//
// Regardless, check if any errors have accumulated, and if so, close the
// response with a 400 and a list of accumulated errors, and throw
//  this validator as an error to |cb|, if present.  Thus,
// |check| may be used as an "anchor test" after other tests have run w/o
// immediately reacting to accumulated errors (e.g. checkFields and chain)
// and it may be relied upon to close a response with an appropriate error
// list and call an error handler (e.g. a waterfall default function),
// leaving the caller to cover the "good" case only.
Validator.prototype.check = function (test, err, cb) {
   if (!test) {
      if (Array.isArray(err))
         this.errors.push({tag: err[0], params: err.slice(1)});
      else
         this.errors.push({tag: err, params: null});
   }

   if (this.errors.length) {
      if (this.res) {
         if (this.errors[0].tag === Validator.Tags.noPermission)
            this.res.status(403).end();
         else if (this.errors[0].tag === Validator.Tags.notFound)
            this.res.status(404).end();
         else
            this.res.status(400).json(this.errors);
         this.res = null;   // Preclude repeated closings
      }
      if (cb)
         cb(this);
   }
   return !this.errors.length;
};

// Somewhat like |check|, but designed to allow several chained checks
// in a row, finalized by a check call.
Validator.prototype.chain = function (test, tag, params) {
   if (!test)
      this.errors.push({tag: tag, params: params || null});
   return this;
};

Validator.prototype.checkAdmin = function (cb) {
   return this.check(this.session && this.session.isAdmin(),
      Validator.Tags.noPermission, cb);
};

// Validate that AU is the specified person or is an admin
Validator.prototype.checkPrsOK = function (prsId, cb) {
   return this.check(this.session &&
    (this.session.isAdmin() || this.session.prsId == prsId),
    Validator.Tags.noPermission, cb);
};

Validator.prototype.hasOnlyFields = function (obj, fieldList) {
   Object.keys(obj).forEach((prop) => {
      this.chain(fieldList.indexOf(prop) >= 0, Validator.Tags.forbiddenField, [prop]);
   });
   return this;
};

// Check presence of truthy property in |obj| for all fields in fieldList
Validator.prototype.hasFields = function (obj, fieldList, cb) {

   fieldList.forEach((name) => {
      this.chain(obj.hasOwnProperty(name) && obj[name] !== "" && obj[name]
       !== null && obj[name] !== undefined,
       Validator.Tags.missingField, [name]);
   });

   return this.check(true, null, cb);
};

module.exports = Validator;
