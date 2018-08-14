import * as api from '../api';

// Attach standard error handling dispatch "catch" to |promise| and also
// add a standard "then" handler for |cb|, ultimately returning the final
// value of the promise.
function addStdHandlers(dsp, cb, promise) {
   return promise.catch((errList) => dsp({type: 'SHOW_ERR', details: errList}))
   .then((val) => {if (cb) cb(); return val;});
}

export function signIn(credentials, cb) {
   return (dispatch, prevState) => {
      addStdHandlers(dispatch, cb,
       api.signIn(credentials)
      .then((userInfo) => dispatch({ user: userInfo, type: "SIGN_IN" })));
   }
}

export function getCtp(ctpId, cb){
   return ((dispatch, prevState) => {
      addStdHandlers(dispatch, cb,
      api.getCtpById(ctpId)
      .then((ctp) => {
         dispatch({ type: 'GET_CTP', ctp });
      })
      .then(() => {if (cb) cb()})
   )})
}

export function getAllCmps( cb) {
   return (dispatch, prevState) => {
      api.getCmps()
      .then((cmps) => {
         Object.keys(cmps).forEach((key) => {
            cmps[key] = Object.assign(cmps[key], {cmpTeams : []});
         })
         dispatch({ type: 'GET_CMPS', cmps });
      })
      .then(() => {if (cb) cb()})
   }
}

export function getMyCmps(id, cb) {
   return ((dispatch, prevState) => {
      api.getCmpsByPerson(id)
      .then((cmps) => {
         Object.keys(cmps).forEach((key) => {
            cmps[key].cmpTeams = []});
         dispatch({ type: 'GET_PRS_CMPS', cmps });
      })
      .then(() => {if (cb) cb()});
   })
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

export function postTeam(cmpId, newTeamData, cb) {
   return (dispatch, prevState) => {
      addStdHandlers(dispatch, cb,
       api.postTeam(cmpId, newTeamData)
      .then((newTeamId) => {
         var prs = prevState().prs;
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
   return (dispatch, prevState) => {
      api.putTeam(cmpId, teamId, newTeamData)
      .then(() => {
          newTeamData.id = teamId;
          dispatch({ type: 'PUT_TEAM', newTeamData});
       })
      .then(() => {if (cb) cb()});
   }
}

// Get basic team info for all teams of which the specified prsId is a member.
// Leave members empty and toggled false.  (Later actions may populate members.)
// Dispatch an update for the teams property of app state.
export function getTeamsByPrs(prsId, cb) {
   return (dispatch, prevState) => {
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

export function getTeamsByCmp(cmpId, cb) {
   return (dispatch, prevState) => {
      api.getTeamsByCmp(cmpId)
      .then((teams) => {
         Object.keys(teams).forEach((key) => {
            teams[key] = Object.assign(teams[key],
             {mmbs : {}, toggled: false});
         })
         dispatch({type: 'GET_CMP_TEAMS', teams, cmpId})

      })
      .then(() => {if (cb) cb()})}
}


export function delTeam(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.delTeam(cmpId , teamId).then(() =>
       dispatch({type: 'DEL_TEAM', teamId}))
      .then(() => {if (cb) cb()})
   }
}

export function addMmb(mmbEmail, cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.getPrssByEmail(mmbEmail)
      .then(prss => api.getPrs(prss[0].id))
      .then(prs => api.postMmb(prs.id, cmpId, teamId)
      .then(() => prs))//whats this for?
      .then(prs => dispatch({type: 'ADD_MMB', teamId, prs}))
      .catch(err => dispatch({type: 'SHOW_ERR',
        details: `Can't add member: ${err}`}))
      .then(() => {if (cb) cb()})
   }
}

export function delMmb(cmpId, teamId, prsId, cb) {
   console.log(`Deleting ${cmpId}/${teamId}/${prsId}`);

   return (dispatch, prevState) => {
      addStdHandlers(dispatch, cb, api.delMmb(cmpId, teamId, prsId)
      .then(()=>dispatch({type: 'DEL_MMB', teamId, prsId})));
   }
}

export function getMmbs(cmpId, teamId, cb) {
   return (dispatch, prevState) => {
      api.getMmbs(cmpId, teamId)
      .then((mmbs) => {
         return dispatch({type: 'GET_TEAM_MMBS', teamData: {teamId, mmbs}});
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
