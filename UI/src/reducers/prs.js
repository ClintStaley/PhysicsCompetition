export default function prss(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
      console.log(state);
         return action.user
      case 'SIGN_OUT':
         return {} // Clear user state
      default:
         return state
   }
}
