import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'GET_CMP_TEAMS':
      case 'GET_PRS_TEAMS': // Replace previous team
         return Object.assign({}, state, action.teams);
      case 'GET_TEAM_MMBS':
         // Add membership data to a team
         return Object.assign({}, state,
          {[action.teamData.teamId]: Object.assign({},
          state[action.teamData.teamId] , {mmbs: action.teamData.mmbs})});
      case 'PUT_TEAM':
         var data = action.newTeamData;
         // Overwrite only actually-changed elements in the team
         return Object.assign({}, state, {[data.id]:
          Object.assign({}, state[data.id], data)});
      case 'ADD_TEAM':
         return Object.assign({}, state, action.teamData);
      case 'DEL_TEAM':
         return update(state, {$unset: [action.teamId]});
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
