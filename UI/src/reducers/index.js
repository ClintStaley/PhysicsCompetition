import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import prss from './prss';
import cmps from './cmps';
import teams from './teams';

//combines all reducers
const rootReducer = combineReducers({ prss, cmps, teams });

export default rootReducer;
