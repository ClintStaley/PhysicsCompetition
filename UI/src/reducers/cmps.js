export default function cmps(state = {}, action) {
   var cmpId, teamId, newTeamArr, cmpData;

   switch (action.type) {
      case 'GET_PRS_CMPS': // Get cmps for one prs
      case 'GET_CMPS':     // Replace previous cmps
      case 'ADD_CMPS':     // Add cmps to the master cmps object
         return Object.assign({}, state, action.cmps);
      case 'PUT_CMP':      // Update only changed fields of a cmp
         cmpId = action.cmpData.cmpId;
         cmpData = action.cmpData.newCmpData;

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], cmpData)});
      case 'GET_CMP_TEAMS': // Update the cmpTeams link from a cmp
         cmpId = action.cmpId;
         var teamIds = Object.keys(action.teams);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: teamIds})});
      case 'ADD_TEAM':
         teamId = action.newTeamData.id;
         cmpId = action.newTeamData.cmpId;
         newTeamArr = state[cmpId].cmpTeams.concat(teamId.toString());

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});
       case 'SIGN_OUT':
          return {} // Clear user state
      default:
         return state;
   }
}
