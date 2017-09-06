import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { HashRouter } from 'react-router-dom'
import { Route } from 'react-router'

// Redux
import { createStore, applyMiddleware} from 'redux'
import { middleware as fetchMiddleware} from 'react-redux-fetch'
import { Provider } from 'react-redux'
import reducer from './reducers'

// material-ui
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const store = createStore(
    reducer,
    applyMiddleware(fetchMiddleware)
);

const BlockAvoider = (props) => {
  // <BlockAvoider> receives the location as a prop. Any child
  // element is creates can be passed the location.
  return (
  	<App location={props.location} history={props.history} />
  )
}

ReactDOM.render(
	<Provider store={store}>
		<MuiThemeProvider>
			<HashRouter>
				<Route render={BlockAvoider} />
			</HashRouter>
	  	</MuiThemeProvider>
	</Provider>,
	document.getElementById('root')
);
// registerServiceWorker();