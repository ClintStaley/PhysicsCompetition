import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import prs from './prs';
import cmps from './cmps';
import teams from './teams';
import updateTimes from './updateTimes';

//combines all reducers
const rootReducer = combineReducers({ prs, cmps, teams , updateTimes});

export default rootReducer;
