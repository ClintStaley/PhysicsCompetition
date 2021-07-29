export default function ctps(state = {}, action) {
   switch(action.type) {
   case 'GET_CTP':
      return Object.assign({}, state, {[action.ctp.id]: action.ctp});
   case 'GET_CTPS':
      return Object.keys(action.ctps).length ?
       Object.assign(state,action.ctps) : state;
   case 'SIGN_OUT':
      return {} // Clear user state
   default:
      return state;
   }
}
