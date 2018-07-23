import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'GET_TEAM': // Replace previous team
         return action.teams;
      case 'TOGGLE_TEAM':
         var teamId = action.memberData.teamId;
         var members = action.memberData.members;
         //update allows adding new data to the object while remaining immutable
         //will change the team.toggled state

         // If newly selected team has no members, assign members to it
         if (Object.keys(state[teamId].members).length === 0) {
            return Object.assign({}, state, {
               [teamId]: Object.assign({}, state[teamId], { toggled: !
                     state[teamId].toggled }, { members: members }) })
         }
         return Object.assign({}, state, {
            [teamId]: Object.assign({}, state[teamId], { toggled: !state[
                  teamId].toggled }) });
      case 'POPULATE_TEAM':
         // Will add member data to the object
         return Object.assign({}, state, {members: action.memberdata.members});
      case 'PUT_TEAM':
         var teamId = action.newTeam.teamId;
         var teamData = action.newTeam.newTeamData;
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
