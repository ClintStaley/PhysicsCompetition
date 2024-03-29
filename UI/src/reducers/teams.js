export default function teams(state = [], action) {
   let teamId = action.teamId;
   let team = state[teamId];
   let mmbs;

   switch (action.type) {
      // Action has array teams.  Save existing mmbs if any, and swap out teams
      case 'GET_PRS_TEAMS':
      case 'GET_CMP_TEAMS':
         if (action.teams.length) {
            state = state.slice();
            action.teams.forEach(team => {
               if (state[team.id])
                  team.mmbs = state[team.id].mmbs;
               state[team.id] = team;
            });
         }
         return state;

      case 'GET_TEAM_MMBS':
         state = state.slice();
         mmbs = [];
         action.mmbs.forEach(mmb => mmbs[mmb.id] = mmb);
         state[teamId] = Object.assign({}, state[teamId], {mmbs});
         return state;

      case 'PUT_TEAM':
         state = state.slice();
         state[teamId] = Object.assign({}, state[teamId], action.team);
         return state;

      case 'ADD_TEAM':
      case 'GET_TEAM':
         state = state.slice();
         state[teamId] = action.team;
         return state;

      case 'DEL_TEAM':
         return state.slice(teamId, 1);
      case 'ADD_MMB':
         let prs = action.prs;
         mmbs = team.mmbs;

         // Add this member only if members are currently loaded into store
         if (mmbs.length) {
            mmbs = [...mmbs];
            mmbs[prs.id] = {
               id: prs.id, 
               email: prs.email,
               firstName: prs.firstName, 
               lastName: prs.lastName
            };
            state = state.slice();
            state[teamId] = Object.assign({}, state[teamId], mmbs)
         }
         return state;

      case 'DEL_MMB':
         mmbs = team.mmbs;

         if (mmbs.length) {
            mmbs = mmbs.slice(action.prsId, 1);
            state = state.slice();
            state[teamId] = Object.assign({}, team, mmbs);
         }
         return state;

      case 'SIGN_OUT':
         return [];
      default:
         return state;
   }
}
