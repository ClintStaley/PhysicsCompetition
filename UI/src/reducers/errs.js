export default function errs(state = [], action) {
   switch(action.type) {
   case 'SHOW_ERR':
      return action.details;
   case 'CLEAR_ERRS':
      return [];
   default:
      return state;
   }
}
