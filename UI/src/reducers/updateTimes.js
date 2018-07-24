export default function cmps(state = {}, action) {
   switch (action.type) {
      case 'UPDATE_TEAMS':
         return Object.assign({}, state, { teams: new Date() };
      case 'UPDATE_PERSON':
         return Object.assign({}, state, { prs: new Date() };
      case 'UPDATE_MYCMPS':
         return Object.assign({}, state, { myCmps: new Date() };
      case 'UPDATE_RESULTS':
         return Object.assign({}, state, { results: new Date() };
      default:
         return state;
   }
}
