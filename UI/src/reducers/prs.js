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
         // Add the newly created team to my teams
         var teamId = action.newTeamData.id.toString();
         var newTeams = state.myTeams.concat([teamId]);

         // Add the relevant cmp only if I'm not already in it via another team
         var cmpId = action.newTeamData.cmpId.toString();
         var myCmps = state.myCmps;
         var newCmps = myCmps.includes(cmpId) ? myCmps : myCmps.concat([cmpId]);

         return Object.assign({}, state, {myTeams: newTeams, myCmps: newCmps});
      case 'GET_TEAM_MMBS':
         if (Object.keys(action.teamData.mmbs).includes(state.id.toString()))
            if (!state.myTeams.includes(action.teamData.teamId))
               return Object.assign({}, state, {myTeams:
                state.myTeams.concat(action.teamData.teamId)});
         return state;
      case 'DEL_MMB':
         return Number(action.prsId) !== state.id ? state :
          Object.assign({}, state, {myTeams:
          state.myTeams.filter(teamId => teamId !== action.teamId)});
      default:
         return state
   }
}
