export default function ctps(state = {}, action) {
   switch(action.type) {
   case 'GET_CTP':
      return Object.assign({}, state, {[action.ctp.id]: action.ctp});
   case 'GET_CTPS':
      return Object.assign(state , action.ctps);
   case 'SIGN_OUT':
      return {} // Clear user state
   default:
      return state;
   }
}
