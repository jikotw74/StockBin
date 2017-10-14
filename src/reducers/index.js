import { combineReducers } from 'redux';
import app from './app';
import stockInfo from './stockInfo';
import {reducer as fetchReducer} from 'react-redux-fetch';

const appReducer = combineReducers({
	app,
	stockInfo,
	repository: fetchReducer
});

export default appReducer;
