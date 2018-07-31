export default function ctps(state = {}, action) {
   switch(action.type) {
   case 'GET_CTPS':
      return action.ctps;
   case 'GET_CTP':
      return Object.assign({}, state, {[action.ctp.id]: action.ctp});
   case 'SIGN_OUT':
      return {} // Clear user state
   default:
      return state;
   }
}
