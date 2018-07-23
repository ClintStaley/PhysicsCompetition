import * as api from '../api';
import { history } from '../store';


export function signIn(credentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credentials)
      .then((userInfo) => dispatch({ user: userInfo, type: "SIGN_IN" }))
      .then(() => {if (cb) cb()})
      .catch((error) => dispatch({ type: 'SIGN_IN_FAILED', error }))
   }
}

export function updateCmps(id, cb) {
   return (dispatch, prevState) => {
      api.getCmps(id)
      .then((cmps) => dispatch({ type: 'UPDATE_CMPS', cmps }))
      .then(() => {if (cb) cb()})

   }
}

export function editTeam(cmpId, teamId, newTeamData, cb) {
   return (dispatch, prevState) => {
      api.putTeam(cmpId, teamId, newTeamData)
      .then(() => {
          var teamData = {newTeamData : newTeamData, teamId: teamId};
          dispatch({ type: 'PUT_TEAM', teamData});
       })
      .then(() => {if (cb) cb()});
   }
}

// Get team info, and augment each team description with empty members
// and closed member-toggle.  Dispatch a team update with the augmented
// team list.
export function getTeams(teamId, cb) {
   return (dispatch, prevState) => {
      api.getTeams(teamId)
      .then((teams) => {
         Object.keys(teams).map((teamNum) => {
            teams[teamNum].members = {};
            teams[teamNum].toggled = false;
         });
         return dispatch({ type: 'GET_TEAM', teams});
      })
      .then(() => {if (cb) cb()})}
}

export function deleteTeam(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.delTeam(cmpId , teamId).then(() =>
       dispatch({ type: 'DELETE_TEAM', teamId}))
      .then(() => {if (cb) cb()})
   }
}


export function toggleTeam(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      dispatch({ type: 'TOGGLE_TEAM', teamId })
       //.then(() => {if (cb) cb()})
   }
}

export function updateMembers(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.getMembers(cmpId, teamId)
      .then((members) => {
         var teamData = {};
         teamData.members = members;
         teamData.teamId = teamId;
         return dispatch({ type: 'POPULATE_TEAM', teamData });
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
         dispatch({type: "ERROR", err});
      })
   }
}
