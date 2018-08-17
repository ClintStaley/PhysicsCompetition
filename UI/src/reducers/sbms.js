export default function sbms(state = {}, action) {
   switch (action.type) {
      case 'GET_SBMS':
      console.log("GET_SBMS", action.sbms)
         return action.sbms;
      case 'POST_SBM':
         return {
            ctpName: state.ctpName, // No change
            current: action.sbm,
            history: [state.current].concat(state.history)};
      case 'REFRESH_SBM':  // Replace just response and score in current
         return Object.assign({}, state,
          {current: Object.assign({}, state.current,
          {response: action.sbm.response, score: action.sbm.score})});
      default:
         return state;
   }
}
