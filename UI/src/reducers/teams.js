import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'ADD_TEAMS': // Replace previous team
         return Object.assign({}, state, action.teams);
      case 'POPULATE_TEAM':
         // Add membership data to a team
         return Object.assign({}, state,
          {[action.teamData.teamId]: Object.assign({},
          state[action.teamData.teamId] , {members: action.teamData.members})});
      case 'PUT_TEAM':
         var teamId = action.teamData.teamId;
         var teamData = action.teamData.newTeamData;

         // Overwrite only actually-changed elements in the team
         return Object.assign({}, state, {[teamId]:
          Object.assign({}, state[teamId], teamData)});
      case 'DELETE_TEAM':
         return update(state, {$unset: [action.teamId]});
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
