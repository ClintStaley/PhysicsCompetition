import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actionCreators from '../actions/actionCreators';
import Main from './Main/Main';

function mapStateToProps(state) {
   return {
      Prss: state.Prss,
      Cmps: state.Cmps
   }
}

function mapDispachToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

const App = withRouter(connect(
   mapStateToProps,
   mapDispachToProps,
)(Main));

export default App;
