export default function cmps(state = {}, action) {
   switch (action.type) {
      case 'GET_MY_CMPS':
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
         var cmpArrId = Object.keys(action.teams);   //need to flush out action creator design first

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: cmpArrId})});
      case 'ADD_TEAM':
         var teamId = Object.keys(action.teamData)[0];
         var cmpId = action.teamData[teamId].cmpId
         var cmpArrId = state[cmpId].cmpTeams;
         cmpArrId.push(teamId);

         return Object.assign({}, state, {[cmpId]:
          Object.assign({}, state[cmpId], {cmpTeams: cmpArrId})});
      default:
         return state;
   }
}
