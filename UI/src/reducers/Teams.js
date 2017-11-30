export default function Teams(state = [], action) {
   switch (action.type) {
      case 'UPDATE_TEAM': // Replace previous team
         return action.Teams;
<<<<<<< HEAD
      case 'UPDATE_TEAM':
         for (i = 0; i < state.length; i++)
            if (action.MemberData.teamId === state.Teams[i].id)
               return state;
=======
      case 'TOGGLE_TEAM':
         state[action.teamId].toggled = !state[action.teamId].toggled;
         return state;
      case 'POPULATE_TEAM':
      console.log(state[action.memberData.teamId]);
      console.log(action.memberData.teamId);
      console.log(state);
         state[action.memberData.teamId].members = action.memberData.members;
>>>>>>> 559691e9df82f46632a40e401a0dd1c23921647f
         return state;
      default:
         return state;
   }
}
