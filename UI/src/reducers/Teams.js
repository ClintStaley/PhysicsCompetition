export default function Teams(state = [], action) {
   switch (action.type) {
      case 'UPDATE_TEAM': // Replace previous team
         return action.Teams;
      case 'UPDATE_TEAM':
         for (int i; i < state.length; i++)
            if (action.MemberData.teamId === state.Teams[i].id)
               return state;
         return state;
      default:
         return state;
   }
}
