export default function cmps(state = [], action) {
   switch (action.type) {
      case 'UPDATE_CMPS': // Replace previous cmps
         console.log(state);
         return action.cmps;
      default:
         return state;
   }
}
