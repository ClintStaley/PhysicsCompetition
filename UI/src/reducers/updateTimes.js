export default function updateTimes(state = {}, action) {
   switch (action.type) {
      case 'ADD_TEAMS':
         return Object.assign({}, state, { teams: new Date() });
      case 'SIGN_IN':
         return Object.assign({}, state, { prs: new Date() });
      case 'GET_CMPS':
         return Object.assign({}, state, { cmps: new Date() });
      case 'UPDATE_RESULTS':
         return Object.assign({}, state, { results: new Date() });
      default:
         return state;
   }
}
