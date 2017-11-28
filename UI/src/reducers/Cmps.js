export default function Cmps(state = [], action) {
   switch (action.type) {
      case 'UPDATE_CMPS': // Replace previous cmps
         return action.cmps;
      default:
         return state;
   }
}
