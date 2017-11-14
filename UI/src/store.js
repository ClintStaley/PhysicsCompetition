import { createStore, applyMiddleware } from 'redux';
// import { syncHistoryWithStore} from 'react-router-redux';
import { createBrowserHistory } from 'history';
// import the root reducer
import thunk from 'redux-thunk';

import rootReducer from './reducers/index';

const defaultState = {
};

const store = createStore(rootReducer, defaultState, applyMiddleware(thunk));

export const history = createBrowserHistory();
export default store;
