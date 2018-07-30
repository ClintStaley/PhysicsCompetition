export default function prs(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
         return Object.assign(action.user, {myTeams: [], myCmps: []});
      case 'SIGN_OUT':
         return {} // Clear user state
      case 'GET_PRS_TEAMS':
         return Object.assign({}, state, {myTeams: Object.keys(action.teams)});
      case 'DEL_TEAM':
         return Object.assign({}, state, {})
      case 'GET_PRS_CMPS':
         return Object.assign({}, state, {myCmps: Object.keys(action.cmps)});
      case 'ADD_TEAM':
         var teamId = Object.keys(action.teamData)[0];
         var myTeams = state.myTeams;
         myTeams.push(teamId); // CAS FIX: No!  Must use concat.

         return Object.assign({}, state, {myTeams});
      case 'DEL_MMB':
         return Number(action.prsId) !== state.id ? state : Object.assign({}, state, {myTeams: state.myTeams.filter(teamId => teamId !== action.teamId)});
      default:
         return state
   }
}
