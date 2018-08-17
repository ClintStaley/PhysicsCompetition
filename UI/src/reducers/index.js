import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux';


import prs from './prs';
import cmps from './cmps';
import teams from './teams';
import errs from './errs';
import ctps from './ctps'
import updateTimes from './updateTimes';
import sbms from './sbms';

//combines all reducers
const rootReducer = combineReducers({ prs, cmps, teams, updateTimes,
 ctps, errs, sbms});

export default rootReducer;
