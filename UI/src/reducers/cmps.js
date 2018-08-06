export default function cmps(state = {}, action) {
   switch (action.type) {
      case 'GET_PRS_CMPS':
      case 'GET_CMPS': // Replace previous cmps
         return Object.assign({}, state, action.cmps);
      case 'ADD_CMPS': // add cmps to the master cmps object
         return Object.assign({}, state, action.cmps);
      case 'PUT_CMP':
         var cmpId = action.cmpData.cmpId;
         var cmpData = action.cmpData.newCmpData;

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], cmpData)});
      case 'GET_CMP_TEAMS':
         var cmpId = action.cmpId;
         var cmpArrId = Object.keys(action.teams);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: cmpArrId})});
      case 'ADD_TEAM':
         var teamId = action.newTeamData.id;
         var cmpId = action.newTeamData.cmpId
         var cmpArrId = state[cmpId].cmpTeams;
         var newTeamArr = cmpArrId.concat(teamId.toString());

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});
       case 'SIGN_OUT':
          return {} // Clear user state
      default:
         return state;
   }
}
