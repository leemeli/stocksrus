import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; //import our component
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import MainPage from './Main';
import firebase from 'firebase';
import Settings from './Settings';
import LoginPage from './Login';
import PersonalTimeline from './PersonalTimeline';
import Portfolio from './Portfolio';

//can load other CSS files (e.g,. Bootstrap) here
import 'bootstrap/dist/css/bootstrap.css';

//load our CSS file
import './index.css';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBdng3b4dOrrRzHCsGNtintoohihmPzVDU",
  authDomain: "stocks-r-us.firebaseapp.com",
  databaseURL: "https://stocks-r-us.firebaseio.com",
  storageBucket: "stocks-r-us.appspot.com",
  messagingSenderId: "71820765377"
};
firebase.initializeApp(config);

//render the Application view with routes!
ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={MainPage} />
      <Route path="login" component={LoginPage} />
      <Route path="main" component={MainPage} />
      <Route path="settings" component={Settings} />
      <Route path="mytimeline" component={PersonalTimeline} />
      <Route path="portfolio" component={Portfolio} />
    </Route>
  </Router>,
  document.getElementById('root')
);
