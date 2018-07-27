export default function errs(state = [], action) {
   console.log("Errs reducing action " + action.type);
   switch(action.type) {
   case 'SHOW_ERR':
      return state.concat(action.details);
   case 'CLEAR_ERRS':
      return [];
   default:
      return state;
   }
}
