import { combineReducers } from 'redux';
import app from './app';
import {reducer as fetchReducer} from 'react-redux-fetch';

const appReducer = combineReducers({
	app,
	repository: fetchReducer
});

export default appReducer;
