import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actionCreators from '../actions/actionCreators';
import Main from './Main/Main.jsx';

function mapStateToProps(state) {
   return {
      prs: state.prs,
      cmps: state.cmps,
      teams: state.teams,
      updateTimes: state.updateTimes,
      errs: state.errs,
      ctps: state.ctps,
      sbms: state.sbms
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

const App = withRouter(connect(
   mapStateToProps,
   mapDispatchToProps,
)(Main));

export default App;
