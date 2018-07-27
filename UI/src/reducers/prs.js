export default function prs(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
         return action.user
      case 'SIGN_OUT':
         return {} // Clear user state
      case 'GET_MY_TEAMS':
         return Object.assign({}, state, {myTeams: Object.keys(action.teams)});
      case 'GET_MY_CMPS':
         return Object.assign({}, state, {myCmps: Object.keys(action.cmps)});
      case 'ADD_TEAM':
         var teamId = Object.keys(action.teamData)[0];
         var myTeams = state.myTeams;
         if (!myTeams)
            myTeams = [];
         myTeams.push(teamId);
         
         return Object.assign({}, state, {myTeams: myTeams});
      default:
         return state
   }
}
