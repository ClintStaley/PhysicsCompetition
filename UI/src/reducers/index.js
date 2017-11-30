import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import Prss from './Prss';
import Cmps from './Cmps';
import teams from './teams';

const rootReducer = combineReducers({ Prss, Cmps, teams });

export default rootReducer;
