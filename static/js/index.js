import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import TableViewbi from './TableViewbi';
import ExportTablesbi from './ExportTablesbi';
import Chartbi from './Chartbi';

require('../main.css');

const tableviewbi = document.getElementById('tableviewbi');
if (tableviewbi) {
   ReactDOM.render(<TableViewbi />, tableviewbi);
}

const exporttablesbi = document.getElementById('exporttablesbi');
if (exporttablesbi) {
   ReactDOM.render(<ExportTablesbi />, exporttablesbi);
}

const chartbi = document.getElementById('chartbi');
if (chartbi) {
   ReactDOM.render(<Chartbi />, chartbi);
}