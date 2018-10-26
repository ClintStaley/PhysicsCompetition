export default function cmps(state = {}, action) {
   var cmpId, teamId, cmpArrId, newTeamArr, cmpData;

   switch (action.type) {
      case 'GET_PRS_CMPS':
      case 'GET_CMPS': // Replace previous cmps
         return Object.assign({}, state, action.cmps);
      case 'ADD_CMPS': // add cmps to the master cmps object
         return Object.assign({}, state, action.cmps);
      case 'PUT_CMP':
         cmpId = action.cmpData.cmpId;
         cmpData = action.cmpData.newCmpData;

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], cmpData)});
      case 'GET_CMP_TEAMS':
         cmpId = action.cmpId;
         cmpArrId = Object.keys(action.teams);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: cmpArrId})});
      case 'ADD_TEAM':
         teamId = action.newTeamData.id;
         cmpId = action.newTeamData.cmpId;
         cmpArrId = state[cmpId].cmpTeams;
         newTeamArr = cmpArrId.concat(teamId.toString());

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: newTeamArr})});
       case 'SIGN_OUT':
          return {} // Clear user state
      default:
         return state;
   }
}
