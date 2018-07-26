export default function cmps(state = [], action) {
   switch (action.type) {
      case 'GET_CMPS': // Replace previous cmps
         return Object.assign({}, state, action.cmps);
      case 'GET_MY_CMPS': // add cmps to the master cmps object
         var newstate = Object.assign({}, state, action.cmps);
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

      default:
         return state;
   }
}
