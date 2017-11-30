export default function Teams(state = [], action) {
   switch (action.type) {
      case 'UPDATE_TEAM': // Replace previous team
         return action.Teams;
      case 'TOGGLE_TEAM':
         state[action.teamId].toggled = !state[action.teamId].toggled;
         return state;
      case 'POPULATE_TEAM':
         state[action.memberData.teamId].members = action.memberData.members;
         return state;
      default:
         return state;
   }
}
