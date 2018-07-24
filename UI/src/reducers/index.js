import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import prss from './prss';
import cmps from './cmps';
import teams from './teams';
import updateTimes from './updateTimes';

//combines all reducers
const rootReducer = combineReducers({ prss, cmps, teams , updateTimes});

export default rootReducer;
