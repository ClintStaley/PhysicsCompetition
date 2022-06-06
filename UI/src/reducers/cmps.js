
export default function cmps(state = [], action) {
   var cmpId = action.cmpId, teamId = action.teamId, newTeamArr;

   switch (action.type) {
      // Action is cmpId indexed map of cmp data
      case 'GET_PRS_CMPS':
      case 'GET_CMPS':     // Replace/augment existing cmps
         if (action.cmps.length) {
            state = [...state];
            action.cmps.forEach(val => state[val.id] = val);
         }
         return state;

      // Action is cmpID and newData object
      case 'PUT_CMP':      // Update only changed fields of a cmp
         state = [...state];
         state[cmpId] = Object.assign({}, state[cmpId], action.newData);
         return state;

      // Action is a cmpId and a teamId-indexed map of team data
      case 'GET_CMP_TEAMS':
         state = [...state];
         state[cmpId] = Object.assign({}, state[cmpId], 
            {cmpTeams: action.teams.map(team => team.id)});
         return state;

         // Action is single newTeamData object
      case 'ADD_TEAM':
         var oldCmp = state[cmpId];
         state = [...state];
         state[cmpId] = Object.assign({}, oldCmp,
          {cmpTeams: oldCmp.teams.concat(teamId)});
         return state;

      // Action is just a teamId to be deleted
      case 'DEL_TEAM':
         newTeamArr = state[cmpId].cmpTeams.filter(id => id !== teamId);
         state = [...state];
         state[cmpId] = Object.assign({}, state[cmpId], {cmpTeams: newTeamArr});
         return state;

      // Action has no data
      case 'SIGN_OUT':
         return {} // Clear user state
   }
   
   return state;
}
