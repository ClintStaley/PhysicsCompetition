export default function prs(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
      console.log(state);
         return action.user
      case 'SIGN_OUT':
         return {} // Clear user state
      case 'GET_MY_TEAMS':
            return Object.assign({}, state, )
      default:
         return state
   }
}
