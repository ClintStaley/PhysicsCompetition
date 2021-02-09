import * as api from '../api';

// Attach standard error handling dispatch "catch" to |promise| and also
// add a standard "then" handler for |cb|, ultimately returning the final
// value of the promise.
function addStdHandlers(dsp, cb, promise) {
   promise
   .catch((errList) => {
      console.log(errList);
       dsp({type: 'SHOW_ERR', details: errList});
       return Promise.reject();  // Skip downstream "thens".
    })
   .then((val) => {if (cb) cb(); return val;});
}

export function signIn(credentials, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.signIn(credentials)
      .then((userInfo) => dispatch({type: "SIGN_IN", user: userInfo})));
   }
}

export function register(user, cb){
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.registerUser(user));
   }
}

export function getCtp(ctpId, cb){
   return ((dispatch, getState) => {
      addStdHandlers(dispatch, cb,
      api.getCtpById(ctpId)
      .then((ctp) => {
         dispatch({ type: 'GET_CTP', ctp });
      })
      .then(() => {if (cb) cb()})
   )})
}

export function getAllCmps( cb) {
   return (dispatch, getState) => {
      api.getCmps()
      .then((cmps) => {
         Object.keys(cmps).forEach(key => {cmps[key].cmpTeams = []});
         dispatch({ type: 'GET_CMPS', cmps });
      })
      .then(() => {if (cb) cb()})
   }
}

// Get basic team info for all teams of which the specified prsId is a member.
// Leave members empty and toggled false.  (Later actions may populate members.)
// Dispatch an update for the teams property of app state.
export function getTeamsByPrs(prsId, cb) {
   return (dispatch, getState) => {
      api.getTeamsByPrs(prsId)
      .then((teams) => {
         Object.keys(teams).forEach((key) => {
            teams[key] = Object.assign(teams[key],
             {mmbs : {}, toggled: false});
         })
         dispatch({type: 'GET_PRS_TEAMS', teams})

      })
      .then(() => {if (cb) cb()})}
}

export function getCmpsByPrs(id, cb) {
   return ((dispatch, getState) => {
      api.getCmpsByPerson(id)
      .then((cmps) => {
         Object.keys(cmps).forEach(key => {cmps[key].cmpTeams = []});
         dispatch({type: 'GET_PRS_CMPS', cmps});
      })
      .then(() => {if (cb) cb()});
   })
}

export function putCmp(cmpId, newCmpData, cb) {
   return (dispatch, getState) => {
      api.putCmp(cmpId, newCmpData)
      .then(() => {
          var cmpData = {newCmpData : newCmpData, cmpId: cmpId};
          dispatch({ type: 'PUT_CMP', cmpData});
       })
      .then(() => {if (cb) cb()});
   }
}

export function postTeam(cmpId, newTeamData, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.postTeam(cmpId, newTeamData)
      .then((newTeamId) => {
         var prs = getState().prs;
         newTeamData.id = newTeamId;
         newTeamData.mmbs = {[prs.id]: {email: prs.email, isLeader: true,
          firstName: prs.firstName, lastName: prs.lastName, id: prs.id}};
         newTeamData.cmpId = cmpId;

         dispatch({ type: 'ADD_TEAM', newTeamData});
      })
      .then(() => {if (cb) cb()}));
   }
}

export function putTeam(cmpId, teamId, newTeamData, cb) {
   return (dispatch, getState) => {
      api.putTeam(cmpId, teamId, newTeamData)
      .then(() => {
          newTeamData.id = teamId;
          dispatch({ type: 'PUT_TEAM', newTeamData});
       })
      .then(() => {if (cb) cb()});
   }
}

export function getTeamsById(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      api.getTeamsById(cmpId, teamId)
      .then((team) => {
         team.mmbs = {};
         team.toggled = false;
         dispatch({type: 'GET_TEAM',  newTeamData: team});
      })
      .then(() => {if (cb) cb()})}
}


export function getTeamsByCmp(cmpId, cb) {
   return (dispatch, getState) => {
      api.getTeamsByCmp(cmpId)
      .then((teams) => {
         Object.keys(teams).forEach((key) => {
            teams[key].mmbs = {};
            teams[key].toggled = false;
         });
         dispatch({type: 'GET_CMP_TEAMS', teams, cmpId})
      })
      .then(() => {if (cb) cb()})}
}

export function delTeam(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      api.delTeam(cmpId, teamId).then(() =>
       dispatch({type: 'DEL_TEAM', teamId,
        cmpId, teamInfo: getState().teams}))
      .then(() => {if (cb) cb()})
   }
}

export function addMmb(mmbEmail, cmpId, teamId, cb) {
   return (dispatch, getState) => {
      api.getPrssByEmail(mmbEmail)
      .then(prss => api.getPrs(prss[0].id))
      .then(prs => api.postMmb(prs.id, cmpId, teamId)
       .then(() => prs)) // Subpromise returns prs for full info in dispatch
      .then(prs => dispatch({type: 'ADD_MMB', teamId, prs}))
      .catch(err => dispatch({type: 'SHOW_ERR',
        details: [`Can't add member: ${err}`]}))
      .then(() => {if (cb) cb()})
   }
}

// Assume teamId is string
export function delMmb(cmpId, teamId, prsId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb, api.delMmb(cmpId, teamId, prsId)
       .then(()=>dispatch({type: 'DEL_MMB', prsId, teamId,
       cmpId: cmpId.toString(), teamInfo: getState().teams})));
   }
}

export function getTeamMmbs(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      api.getTeamMmbs(cmpId, teamId)
      .then((mmbs) => {
         return dispatch({type: 'GET_TEAM_MMBS',
          teamData: {id: teamId, mmbs, cmpId: parseInt(cmpId, 10)}});
      })
      .then(() => {if (cb) cb()})
   }
}

// Post a submission, and refresh relevant team information to
// reflect e.g. canSubmit, number of attempts, etc.
export function postSbm(cmpId, teamId, submit, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.postSbm(cmpId, teamId, submit)
       .then(() =>  api.getSbms(cmpId, teamId, 1))
       .then((sbms) => dispatch({type: "POST_SBM", sbm: sbms[0]}))
       .then(() => api.getTeamsById(cmpId, teamId, cb))
       .then((team) => {
          dispatch({type: "GET_TEAM", newTeamData: team});
       })
    )};
}

export function getSbms(cmp, teamId, cb) {
   return (dispatch) => {
      addStdHandlers(dispatch, cb,
       api.getSbms(cmp.id, teamId, 1)
       .then(sbm => api.getCtpById(cmp.ctpId) // Subpromise intentional
          .then(ctp => dispatch({
             type: "GET_SBMS",
             sbms: {ctpName: ctp.codeName, current: sbm[0], history: []}
          }))
       ));
   };
}

export function refreshSbms(cb) {
   return (dispatch, getState) => {
      var current = getState().sbms.current;

      addStdHandlers(dispatch, cb,
       api.getSbms(current.cmpId, current.teamId, 1)
       .then(sbms => dispatch({type: "REFRESH_SBM", sbm: sbms[0]})));
   }
}

export function signOut(cb) {
   return (dispatch, getState) => {
      api.signOut()
      .then(() => dispatch({ type: 'SIGN_OUT' }))
      .then(() => {if (cb) cb()})
      .catch((err) => {
         dispatch({type: "SHOW_ERR", err});
      })
   }
}

export function clearErrors(cb) {
   return (dispatch, getState) => {
      dispatch({type: "CLEAR_ERRS"});
      if (cb)
         cb();
   };
}
