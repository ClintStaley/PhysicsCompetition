import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'GET_TEAM': // Replace
         //previous team
         return action.teams;
      case 'TOGGLE_TEAM':
         var teamId = action.memberData.teamId;
         var members = action.memberData.members;
         //update allows adding new data to the object while remaining immutable
         //will change the team.toggled state

         if (Object.keys(state[action.memberData.teamId].members).length === 0) {
            return Object.assign({}, state, {
               [teamId]: Object.assign({}, state[teamId], { toggled: !
                     state[teamId].toggled }, { members: members }) })
            //update(update(state, {[teamId]:{members:{$set :members}}}), {[teamId]:{toggled:{$set :!state[teamId].toggled}}});
         }
         return Object.assign({}, state, {
            [teamId]: Object.assign({}, state[teamId], { toggled: !state[
                  teamId].toggled }) });
         //update(state, {[action.memberData.teamId]:{toggled:{$set :!state[action.memberData.teamId].toggled}}});
      case 'POPULATE_TEAM':
         //will add member data to the object
         return Object.assign({}, state, { members: action.memberdata.members });
      case 'PUT_TEAM':
         var teamId = action.newTeam.teamId;
         var teamData = action.newTeam.newTeamData;
         console.log(teamId);
         console.log(teamData);
         return Object.assign({}, state, {[teamId]: teamData});
      case 'DELETE_TEAM':
         return update(state, { $unset: [action.teamId] });
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
