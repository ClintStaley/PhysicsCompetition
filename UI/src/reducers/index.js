import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import Prss from './Prss';
import Cmps from './Cmps';

const rootReducer = combineReducers({Prss, Cmps});

export default rootReducer;
