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
         var teamId = action.newTeamData.id;;
         var myTeams = state.myTeams;

         var myNewTeams = myTeams.concat([teamId.toString()]);

         return Object.assign({}, state, {myTeams: myNewTeams});
      case 'GET_TEAM_MMBS':
         if (Object.keys(action.teamData.mmbs).includes(state.id.toString()))
            if (!state.myTeams.includes(action.teamData.teamId))
               return Object.assign({}, state, {myTeams:
                state.myTeams.concat(action.teamData.teamId)});
         return state;
      case 'DEL_MMB':
         return Number(action.prsId) !== state.id ? state : Object.assign({}, state, {myTeams: state.myTeams.filter(teamId => teamId !== action.teamId)});
      default:
         return state
   }
}
