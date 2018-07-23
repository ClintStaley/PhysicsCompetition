import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'GET_TEAM': // Replace previous team
         return action.teams;
      case 'TOGGLE_TEAM':
         //update allows adding new data to the object while remaining immutable
         //will change the team.toggled state
         return Object.assign({}, state, {
          [action.teamId]: Object.assign({}, state[action.teamId],
          { toggled: !state[action.teamId].toggled })
         });
      case 'POPULATE_TEAM':
         // Will add member data to the object
         return Object.assign({}, state,
          {[action.teamData.teamId]: Object.assign({},
          state[action.teamData.teamId] , {members: action.teamData.members})});
      case 'PUT_TEAM':
         var teamId = action.teamData.teamId;
         var teamData = action.teamData.newTeamData;
         console.log(teamId);
         console.log(teamData);
         return Object.assign({}, state, {[teamId]: teamData});
      case 'DELETE_TEAM':
         return update(state, {$unset: [action.teamId]});
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
