export default function errs(state = [], action) {
   switch(action.type) {
   case 'SHOW_ERR':
      return state.concat(action.details);
   case 'CLEAR_ERRS':
      return [];
   default:
      return state;
   }
}
