import * as api from '../api';
import { history } from '../store';

export function signIn(credidentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credidentials)
         .then((userInfo) => dispatch({ user: userInfo, type: "SIGN_IN" }))
         .then(() => {if (cb) cb()})
         .catch((error) => dispatch({ type: 'SIGN_IN_FAILED', error }))
      // setTimeout(() => dispatch({user: credidentials, type: "SIGN_IN"}), 2000);
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
