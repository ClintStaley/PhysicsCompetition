import * as api from '../api';

// General design: arrays come from api.js contiguously 0-indexed, even 
// though ids of teams, ctps and cmps are 1-indexed by nature and
// returned collections are not necessarily id-contiguous.  Any collection 
// of such entities that is part of an action produced by these creators will
// also be such an array since this is the most efficient way to deliver 
// possibly non-id-contiguous data.
// 
// Attach standard error handling dispatch "catch" to |promise| and also
// add a standard "then" handler for |cb|, ultimately returning the final
// value of the promise.
function addStdHandlers(dsp, cb, promise) {
   promise
   .catch((errInfo) => {
      if (!errInfo.status)    // Thrown exception due to error in a "then"
         dsp({type: 'SHOW_ERR', details: [`Unexpected error: ${errInfo}`]});
      else if (errInfo.status === 400)
         dsp({type: 'SHOW_ERR', details: errInfo.details});
      else if (errInfo.status === 401)
         dsp({type: 'SIGN_OUT'});     // Force signed out status if 401
         
      return Promise.reject();             // Skip downstream "thens".
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

export function signOut(cb) {
   return (dispatch) => {
      addStdHandlers(dispatch, cb,
      api.signOut()
       .then(() => dispatch({type: 'SIGN_OUT'}))
       .then(() => {if (cb) cb()}));
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
          dispatch({type: 'GET_CTP', ctp});
       })
   )})
}

export function getAllCtps(cb){
   return(dispatch) => {
      addStdHandlers(dispatch, cb,
       api.getCtps().then((ctps) => {
          dispatch({type: 'GET_CTPS', ctps});
       })
       .then(()=>{if (cb) cb()}));
   }
}

export function getAllCmps(cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.getCmps().then((cmps) => {
         cmps.forEach(cmp => cmp.cmpTeams = []);
         dispatch({ type: 'GET_CMPS', cmps});
      })
      .then(() => {if (cb) cb()}));
   }
}

// Get basic team info for all teams of which the specified prsId is a member.
// Leave members empty and toggled false.  (Later actions may populate members.)
// Dispatch an update for the teams property of app state.
export function getTeamsByPrs(prsId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
      api.getTeamsByPrs(prsId).then((teams) => {
         teams.forEach(team => {
            team.mmbs = [];
            team.toggled = false;
         });
         dispatch({type: 'GET_PRS_TEAMS', teams})
      })
      .then(() => {if (cb) cb()}));
   }
}

export function getCmpsByPrs(id, cb) {
   return ((dispatch, getState) => {
      addStdHandlers(dispatch, cb,
      api.getCmpsByPrs(id).then((cmps) => {
         cmps.forEach(cmp => cmp.cmpTeams = []);
         dispatch({type: 'GET_PRS_CMPS', cmps});
      })
      .then(() => {if (cb) cb()}));
   })
}

export function putCmp(cmpId, newData, cb) {
   return (dispatch) => {
      addStdHandlers(dispatch, cb,
       api.putCmp(cmpId, newData).then(() => {
          dispatch({type: 'PUT_CMP', cmpId, newData});
       })
      .then(() => {if (cb) cb()}));
   }
}

// Post a team and on success give the team one member -- the current AU.
export function postTeam(cmpId, newTeamData, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb, api.postTeam(cmpId, newTeamData)
      .then((team) => {
         var prs = getState().prs;
         team.mmbs = [];
         team.mmbs[prs.id] = {email: prs.email, isLeader: true,
          firstName: prs.firstName, lastName: prs.lastName, id: prs.id};

         dispatch({type: 'ADD_TEAM', teamId: team.id, cmpId, team});
      })
      .then(() => {if (cb) cb()}));
   }
}

export function putTeam(cmpId, teamId, newTeamData, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.putTeam(cmpId, teamId, newTeamData).then(() => {
          newTeamData.id = teamId;  // Add Id and preclude ID alteration
          dispatch({type: 'PUT_TEAM', teamId, team: newTeamData});
       })
      .then(() => {if (cb) cb()}));
   }
}

export function getTeamById(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.getTeamById(cmpId, teamId).then((team) => {
         team.mmbs = [];
         team.toggled = false;
         dispatch({type: 'GET_TEAM',  teamId, team});
      })
      .then(() => {if (cb) cb()}));
   }
}

export function getTeamsByCmp(cmpId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
      api.getTeamsByCmp(cmpId).then((teams) => {
         teams.forEach(team => {
            team.mmbs = [];
            team.toggled = false;
         });
         dispatch({type: 'GET_CMP_TEAMS', teams, cmpId})
      })
      .then(() => {if (cb) cb()}));
   }
}

export function delTeam(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.delTeam(cmpId, teamId).then(() => dispatch({type: 'DEL_TEAM', teamId,
        cmpId, teamInfo: getState().teams}))
      .then(() => {if (cb) cb()}));
   }
}

export function addMmb(mmbEmail, cmpId, teamId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.getPrssByEmail(mmbEmail)                    // Get the person to add
       .then(prss => api.getPrs(prss[0].id))           // get their full data
       .then(prs => api.postMmb(prs.id, cmpId, teamId) // Post the membership
          .then(() => prs)) // Subpromise returns prs for full info in dispatch
       .then(prs => dispatch({type: 'ADD_MMB', teamId, prs}))
       .then(() => {if (cb) cb()}));
   }
}

// Assume teamId is string
export function delMmb(cmpId, teamId, prsId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb, api.delMmb(cmpId, teamId, prsId)
       .then(()=>dispatch({type: 'DEL_MMB', prsId, teamId,
       cmpId, teamInfo: getState().teams})));
   }
}

export function getTeamMmbs(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.getTeamMmbs(cmpId, teamId).then((mmbs) => {
         return dispatch({type: 'GET_TEAM_MMBS', teamId, mmbs});
      })
      .then(() => {if (cb) cb()}));
   }
}

// Post a submission, and refresh relevant team information to
// reflect e.g. canSubmit, number of attempts, etc.
export function postSbm(cmpId, teamId, submit, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.postSbm(cmpId, teamId, submit)
       .then(() =>  api.getSbms(cmpId, teamId, 1))
       .then((sbms) => dispatch({type: "POST_SBM", sbm: sbms[0], teamId}))
       .then(() => api.getTeamById(cmpId, teamId, cb))
       .then((team) => {
          dispatch({type: "GET_TEAM", teamId, team});
       })
    )};
}

export function getSbms(cmp, teamId, cb) {
   return (dispatch) => {
      addStdHandlers(dispatch, cb,
       api.getSbms(cmp.id, teamId, 1) // current only retrieves lastest sbm
       .then(sbms => api.getCtpById(cmp.ctpId) // Subpromise intentional
          .then(ctp => dispatch({
             type: "GET_SBMS", 
             sbm: sbms[0], 
             ctpName: ctp.codeName, 
             teamId
          }))
       ));
   };
}

export function refreshSbms(cmpId, teamId, cb) {
   return (dispatch, getState) => {
      addStdHandlers(dispatch, cb,
       api.getSbms(cmpId, teamId, 1)
       .then(sbms => dispatch({type: "REFRESH_SBM", sbm: sbms[0], teamId})));
   }
}

export function clearErrors(cb) {
   return (dispatch, getState) => {
      dispatch({type: "CLEAR_ERRS"});
      if (cb)
         cb();
   };
}
