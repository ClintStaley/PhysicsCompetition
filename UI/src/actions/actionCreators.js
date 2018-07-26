import * as api from '../api';

export function signIn(credentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credentials)
      .then((userInfo) => dispatch({ user: userInfo, type: "SIGN_IN" }))
      .then(() => {if (cb) cb()})
      .catch((error) => dispatch({ type: 'SIGN_IN_FAILED', error }))
   }
}

export function getAllCmps( cb) {
   return (dispatch, prevState) => {
      api.getCmps()
      .then((cmps) => dispatch({ type: 'GET_CMPS', cmps }))
      .then(() => {if (cb) cb()})

   }
}

export function getMyCmps(id, cb) {
   return (dispatch, prevState) => {
      api.getCmpsByPerson(id)
      .then((cmps) => {
         Object.keys(cmps).forEach((key) => {
            cmps[key] = Object.assign(cmps[key], {cmpTeams : []});
         })
         dispatch({ type: 'GET_MY_CMPS', cmps });
      })
      .then(() => {if (cb) cb()})

   }
}

export function putCmp(cmpId, newCmpData, cb) {
   return (dispatch, prevState) => {
      api.putCmp(cmpId, newCmpData)
      .then(() => {
          var cmpData = {newCmpData : newCmpData, cmpId: cmpId};
          dispatch({ type: 'PUT_CMP', cmpData});
       })
      .then(() => {if (cb) cb()});
   }
}

export function putTeam(cmpId, teamId, newTeamData, cb) {
   return (dispatch, prevState) => {
      api.putTeam(cmpId, teamId, newTeamData)
      .then(() => {
          var teamData = {newTeamData : newTeamData, teamId: teamId};
          dispatch({ type: 'PUT_TEAM', teamData});
       })
      .then(() => {if (cb) cb()});
   }
}

// Get basic team info for all teams of which the specified prsId is a member.
// Leave members empty and toggled false.  (Later actions may populate members.)
// Dispatch an update for the teams property of app state.
export function getTeams(prsId, cb) {
   return (dispatch, prevState) => {
      api.getTeams(prsId)
      .then((teams) => {
         Object.keys(teams).forEach((key) => {
            teams[key] = Object.assign(teams[key],
             {members : {}, toggled: false});
         })
         dispatch({type: 'GET_TEAMS', teams})

      })
      .then(() => {if (cb) cb()})}
}

export function delTeam(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.delTeam(cmpId , teamId).then(() =>
       dispatch({ type: 'DELETE_TEAM', teamId}))
      .then(() => {if (cb) cb()})
   }
}

export function addMmb(mmbEmail, cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.getPrsByEmail(mmbEmail)
      .then(prs => api.postMmb(prs.id, cmpId, teamId).then(() => prs))
      .then((prs) => dispatch({type: 'ADD_TEAM_MMB', prs, teamId}))
      .catch(err => dispatch({type: 'TEAM_ERR', details: err}))
      .then(() => {if (cb) cb()})
   }
}

export function getMmbs(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.getMmbs(cmpId, teamId)
      .then((members) => {
         var teamData = {};
         teamData.members = members;
         teamData.teamId = teamId;
         return dispatch({type: 'GET_MY_TEAMS', teamData});
      })
      .then(() => { if (cb) cb() })
   }
}

export function signOut(cb) {
   return (dispatch, prevState) => {
      api.signOut()
      .then(() => dispatch({ type: 'SIGN_OUT' }))
      .then(() => {if (cb) cb()})
      .catch((err) => {
         console.log("Sign out error!");
         dispatch({type: "ACCOUNT_ERR", err});
      })
   }
}

export function clearErrors(cb) {
   return (dispatch, prevState) => {
      dispatch({type: "CLEAR_ERRS"});
      if (cb)
         cb();
   };
}
