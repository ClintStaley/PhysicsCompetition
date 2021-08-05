/* sbms maintains submission information for multiple teams as GET_SBMS is 
called when we display submission information for each different team.
current state "schema":
   {     
      teamId : {
         ctpName: ctpName,
         current: {...},
         history: []
      },
      ...
   }
*/
export default function sbms(state = {}, action) {
   switch (action.type) {
      case 'GET_SBMS':
         var team = state[action.teamId] &&
          Object.assign({}, state[action.teamId]);
         if (team) { 
            team.history = team.current && team.current.id == action.sbm.id ?
             team.history : [team.current].concat(team.history);
            team.current = action.sbm;
            return Object.assign({}, state, {[action.teamId]: team})
         }
         return Object.assign({}, state, {[action.teamId]:
          {ctpName : action.ctpName, current: action.sbm, history: []}})

      case 'DEL_TEAM':
         var tempState =  Object.assign({}, state)
         if (!tempState.keys)
            return tempState; // no cmps have been loaded   
         delete tempState.ctps[action.teamId];
         return tempState;

      case 'POST_SBM': // runs after getSbm has run recieving an ungraded sbm
         var pastTeam = Object.assign({}, state[action.teamId]);
         var history = pastTeam.current ? 
         [pastTeam.current].concat(pastTeam.history) : pastTeam.history; 
         curTeam = {ctpName: pastTeam.ctpName, current: action.sbm, 
          history};
  
         return Object.assign({}, state, {[action.teamId]: curTeam});

      case 'REFRESH_SBM':  // Replace just testResult and score in current
         if (!action.sbm) 
            return state;
         if(action.sbm.id != state[action.teamId].current.id) {
            var team = Object.assign({}, state[action.teamId]);
            team.history = [team.current].concat(team.history);
            team.current = action.sbm;
            return Object.assign({}, state, {[action.teamId]: team});
         }
         //curTeam = {current: {...}, history: [...]} of current team   
         var curTeam = Object.assign({}, state[action.teamId]);
         curTeam.current = !curTeam.current || !curTeam.current.testResult 
          && action.sbm.testResult ? action.sbm : curTeam.current;
         return Object.assign({}, state, {[action.teamId]: curTeam});

      default:
         return state;
   }
}
