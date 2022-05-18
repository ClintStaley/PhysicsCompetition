
export default function cmps(state = {}, action) {
   var cmpId = action.cmpId, teamId = action.teamId, newTeamArr, cmpData;

   switch (action.type) {
      // Action is cmpId indexed map of cmp data
      case 'GET_PRS_CMPS':
      case 'GET_CMPS':     // Replace/augment existing cmps
         return Object.keys(action.cmps).length ?
          Object.assign(action.cmps, state) : state;

      // Action is single cmp data object
      case 'PUT_CMP':      // Update only changed fields of a cmp
         cmpId = action.cmpData.cmpId;
         cmpData = action.cmpData.newCmpData;

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], cmpData)});

      // Action is a cmpId and a teamId-indexed map of team data
      case 'GET_CMP_TEAMS':
         var teamIds = Object.keys(action.teams).map(  // Get team ID list
          function (x) { return parseInt(x, 10)});

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: teamIds})});
      
      // Action is single newTeamData object
      case 'ADD_TEAM':
         teamId = action.newTeamData.id;
         cmpId = action.newTeamData.cmpId;
         newTeamArr = state[cmpId].cmpTeams.concat(teamId);//.toString());

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});

      // Action is just a teamId to be deleted
      case 'DEL_TEAM':
         newTeamArr = state[cmpId].cmpTeams.filter(id => id !== teamId);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});

      // Action has no data
      case 'SIGN_OUT':
         return {} // Clear user state
         
      default:
         return state;
   }
}
