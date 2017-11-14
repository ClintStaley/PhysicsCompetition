
export default function Cmps(state = [], action) {
   switch (action.type) {
      case 'UPDATE_CMPS': // Replace previous cnvs
         return action.cmps;
      default:
         return state;
   }
}
