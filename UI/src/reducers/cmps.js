export default function cmps(state = {}, action) {
   var cmpId = action.cmpId, teamId = action.teamId, newTeamArr, cmpData;

   switch (action.type) {
      case 'GET_PRS_CMPS':
      case 'GET_CMPS':     // Replace/augment existing cmps
         return Object.keys(action.cmps).length ?
          Object.assign(action.cmps, state) : state;
      case 'PUT_CMP':      // Update only changed fields of a cmp
         cmpId = action.cmpData.cmpId;
         cmpData = action.cmpData.newCmpData;

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], cmpData)});
      case 'GET_CMP_TEAMS': // Update the cmpTeams link from a cmp
         var teamIds = Object.keys(action.teams).map(
          function (x) { return parseInt(x)});

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: teamIds})});
          //.map(function (x) { return parseInt(x, 10)})
      case 'ADD_TEAM':
         teamId = action.newTeamData.id;
         cmpId = action.newTeamData.cmpId;
         newTeamArr = state[cmpId].cmpTeams.concat(teamId);//.toString());

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});
       case 'DEL_TEAM':
         newTeamArr = state[cmpId].cmpTeams.filter(id => id !== teamId);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});
       case 'SIGN_OUT':
          return {} // Clear user state
      default:
         return state;
   }
}
