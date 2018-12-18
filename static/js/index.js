import React, { Component } from "react";
import ReactDOM from "react-dom";

import TableView from "./TableView";
import ExportTables from "./ExportTables";
import Chart from "./Chart";

require('../main.css');

const tableview = document.getElementById('tableview');
if (tableview) {
   ReactDOM.render(<TableView />, tableview);
}

const exporttables = document.getElementById('exporttables');
if (exporttables) {
   ReactDOM.render(<ExportTables />, exporttables);
}

const chart = document.getElementById('chart');
if (chart) {
   ReactDOM.render(<Chart />, chart);
}