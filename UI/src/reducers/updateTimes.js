export default function updateTimes(state = {}, action) {
   switch (action.type) {
      case 'GET_PRS_TEAMS':
         return Object.assign({}, state, { myTeams: new Date() });
      case 'SIGN_IN':
         return Object.assign({}, state, { prs: new Date() });
      case 'GET_CMPS':
         return Object.assign({}, state, { cmps: new Date() });
      case 'GET_PRS_CMPS':
         return Object.assign({}, state, { myCmps: new Date() });
      case 'SIGN_OUT':
         return {} // Clear user state
      default:
         return state;
   }
}
