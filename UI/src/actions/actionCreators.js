import * as api from '../api';
import { history } from '../store';

export function signIn(credidentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credidentials)
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

export function updateTeams(id, cb) {
   return (dispatch, prevState) => {
      api.getTeams(id)
         .then((Teams) => dispatch({ type: 'UPDATE_TEAM', Teams }))
         .then(() => {if (cb) cb()})

   }
}

export function updateMembers(CmpId, TeamId, cb) {
   return (dispatch, prevState) => {
      api.getMembers(CmpId, TeamId)
         .then((Members) => {
            var temp;
            temp.Members = Members;
            temp.TeamId = TeamId;
         })
         .then((MemberData) => dispatch({ type: 'POPULATE_TEAM', MemberData }))
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
