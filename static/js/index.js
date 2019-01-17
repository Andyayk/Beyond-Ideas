import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import TableViewbi from './TableViewbi';
import Chartbi from './Chartbi';

require('../main.css');

const tableviewbi = document.getElementById('tableviewbi');
if (tableviewbi) {
   ReactDOM.render(<TableViewbi />, tableviewbi);
}

const chartbi = document.getElementById('chartbi');
if (chartbi) {
   ReactDOM.render(<Chartbi />, chartbi);
}