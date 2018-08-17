export default function sbms(state = {}, action) {
   switch (action.type) {
      case 'GET_SBMS':
         return action.sbms;
      case 'POST_SBM':
         return {
            ctpName: state.ctpName, // No change
            current: action.sbm,
            history: [state.current].concat(state.history)};
      case 'REFRESH_SBM':  // Replace just response and score in current
         return Object.assign({}, state,
          {current: Object.assign({}, state.current,
          {testResult: action.sbm.testResult, score: action.sbm.score})});
      default:
         return state;
   }
}
