import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import Prss from './Prss';
import Cmps from './Cmps';
import Teams from './Teams';

const rootReducer = combineReducers({ Prss, Cmps, Teams });

export default rootReducer;
