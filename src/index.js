import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, useRouterHistory } from 'react-router';
import {createHashHistory } from 'history';
import Home from './components/home.js';
import './styles/styles.scss';

const appHistory = useRouterHistory(createHashHistory)({queryKey: false});

ReactDOM.render(
	(<Router history={appHistory}>
		<Route path="/" component={Home} />
	</Router>
	),
	document.getElementById('app')
);