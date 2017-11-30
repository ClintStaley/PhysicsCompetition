const baseURL = "http://localhost:3000/";
const headers = new Headers();
let cookie;

headers.set('Content-Type', 'application/json');

const reqConf = {
   headers: headers,        // Indicate JSON content type
   credentials: 'include',  // Send cookies
}

// Heper functions for the comon request types

/**
 * make a post request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function post(endpoint, body) {
   return fetch(baseURL + endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...reqConf
   })
}

/**
 * make a put request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
export function put(endpoint, body) {
   return fetch(baseURL + endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...reqConf
   })
}

/**
 * make a get request
 * @param {string} endpoint
 * @returns {Promise}
 */
export function get(endpoint) {
   return fetch(baseURL + endpoint, {
      method: 'GET',
      ...reqConf
   })
}

export function del(endpoint) {
   return fetch(baseURL + endpoint, {
      method: 'DELETE',
      ...reqConf
   })
}

/* Functions for performing API actions.  All share these principles:

 1. They perform REST interface actions, and simple reprocessing of
 data to/from REST that would reasonably be considered part of the API
 behavior rather than a Redux action.

 2. A good example of 1 is the conversion of all JSON string bodies to
 JS objects before returning, which they all do.

/**
  Sign a user into the service. Return the user data.

  @param {{user: string, password: string}} cred
*/
export function signIn(cred) {
   console.log(cred);
   return post("Ssns", cred)
      .then((response) => {
         var location = response.headers.get("Location").split('/');

         cookie = location[location.length - 1];
         return get("Ssns/" + cookie)
      })
      .then((response) => response.json())
      .then((body) => get('Prss/' + body.prsId))
      .then((userResponse) => userResponse.json())
}

/**
  @returns {Promise} result of the sign out request
*/
export function signOut() {
   return del("Ssns/" + cookie);
}

/**
  Register a user
  @param {Object} user
  @returns {Promise}
*/
export function registerUser(user) {
   return post("Prss", user)
}

export function getCmps(prsId) {
   return get("Prss/" + prsId + "/Competition")
      .then((teamData) => teamData.json())
}

export function getOneCmps(cmpId) {
   return get("Cmps/" + cmpId)
      .then((Competitions) => Competitions.json());
}

export function putCmp(id, body) {
   return put(`Cmps/${id}`, body)
}

export function delCmp(id) {
   return del(`Cmps/${id}`)
}

export function postCmp(body) {
   return post('Cmps', body)
}

export function getTeams(prsId) {
   return get("Prss/" + prsId + "/Teams")
      .then((teamData) => teamData.json())
      .then((TeamData) => {
         var Teams = {};
         for (var i = 0;i < TeamData.length;i++){
            Teams[TeamData[i].id] = TeamData[i];
         }

         return Teams;
      })
}

export function putTeam(id, body) {
   return put(`Teams/${id}`, body)
}

export function delTeam(id) {
   return del(`Teams/${id}`)
}

export function postteam(body) {
   return post('Teams', body)
}

/**
  Return id -> member map rather than simple array of members,
  which the API outta do, really.
*/
export function getMembers(cmpId, TeamId) {
   return get("Cmps/" + cmpId + "/Teams/" + TeamId + "/mmbs")
      .then((memberData) => memberData.json())
      .then((memberData) => {
         var members = {};

         for (var i = 0; i < memberData.length;i++)
            members[memberData[i].id] = memberData[i];

         return members;
      })
}

const errMap = {
   en: {
      missingField: 'Field missing from request: ',
      badValue: 'Field has bad value: ',
      notFound: 'Entity not present in DB',
      badLogin: 'Email/password combination invalid',
      dupEmail: 'Email duplicates an existing email',
      noTerms: 'Acceptance of terms is required',
      forbiddenRole: 'Role specified is not permitted.',
      noOldPwd: 'Change of password requires an old password',
      oldPwdMismatch: 'Old password that was provided is incorrect.',
      dupTitle: 'Conversation title duplicates an existing one',
      dupEnrollment: 'Duplicate enrollment',
      forbiddenField: 'Field in body not allowed.',
      queryFailed: 'Query failed (server problem).'
   },
   es: {
      missingField: '[ES] Field missing from request: ',
      badValue: '[ES] Field has bad value: ',
      notFound: '[ES] Entity not present in DB',
      badLogin: '[ES] Email/password combination invalid',
      dupEmail: '[ES] Email duplicates an existing email',
      noTerms: '[ES] Acceptance of terms is required',
      forbiddenRole: '[ES] Role specified is not permitted.',
      noOldPwd: '[ES] Change of password requires an old password',
      oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
      dupTitle: '[ES] Conversation title duplicates an existing one',
      dupEnrollment: '[ES] Duplicate enrollment',
      forbiddenField: '[ES] Field in body not allowed.',
      queryFailed: '[ES] Query failed (server problem).'
   },
   swe: {
      missingField: 'Ett fält saknas: ',
      badValue: 'Fält har dåligt värde: ',
      notFound: 'Entitet saknas i DB',
      badLogin: 'Email/lösenord kombination ogilltig',
      dupEmail: 'Email duplicerar en existerande email',
      noTerms: 'Villkoren måste accepteras',
      forbiddenRole: 'Angiven roll förjuden',
      noOldPwd: 'Tidiagre lösenord krav för att updatera lösenordet',
      oldPwdMismatch: 'Tidigare lösenord felaktigt',
      dupTitle: 'Konversationstitel duplicerar tidigare existerande titel',
      dupEnrollment: 'Duplicerad inskrivning',
      forbiddenField: 'Förbjudet fält i meddelandekroppen',
      queryFailed: 'Förfrågan misslyckades (server problem).'
   }
}

/**
  Translate an API error tag into an English or other language sentence.
  @param {string} errTag
  @param {string} lang
*/
export function errorTranslate(errTag, lang = 'en') {
   return errMap[lang][errTag] || 'Unknown Error!';
}