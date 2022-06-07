// jshint ignore:start
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

// Our own components
import { App } from './components/concentrator';

// Import global styles accross entire application
import 'bootstrap/dist/css/bootstrap.css'; // Bootstrap
// import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css'; // Our own main stylesheet

import store from './store';

const router = (
  <Provider store={store}>
    <BrowserRouter basename={process.env.PUBLIC_URL} >
      <App></App>
    </BrowserRouter>
  </Provider>
)

ReactDOM.render(router, document.getElementById('root'));
