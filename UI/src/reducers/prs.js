export default function prs(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
      console.log(state);
         return action.user
      case 'SIGN_OUT':
         return {} // Clear user state
      case 'GET_PRS_TEAMS':
         return Object.assign({}, state, {myTeams: Object.keys(action.teams)});
      case 'DEL_TEAM':
         return Object.assign({}, state, {})
      case 'ADD_TEAM':
         var teamId = Object.keys(action.teamData)[0];
         var prsId = action.teamData[teamId].leaderId
         var myTeams = state.myTeams;
         if (!myTeams)
            myTeams = [];

         myTeams.push(teamId);

         return Object.assign({}, state, {myTeams: myTeams});
      default:
         return state
   }
}
