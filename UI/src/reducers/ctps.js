export default function ctps(state = [], action) {
   switch(action.type) {
   case 'GET_CTP':
      return Object.assign([], state, {[action.ctp.id]: action.ctp});

   case 'GET_CTPS':
      if (action.ctps.length) {
         state = state.slice();
         action.ctps.forEach(ctp => state[ctp.id] = ctp);
      }
      return state;
      
   case 'SIGN_OUT':
      return {} // Clear user state
   default:
      return state;
   }
}
