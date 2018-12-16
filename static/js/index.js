import React, { Component } from "react";
import ReactDOM from "react-dom";

import App from "./App";
import TableView from "./TableView";
import Hello from "./Hello";
require('../main.css');

const app = document.getElementById('app');
if (app) {
   ReactDOM.render(<App />, app);
}

const tableview = document.getElementById('tableview');
if (tableview) {
   ReactDOM.render(<TableView />, tableview);
}

const hello = document.getElementById('hello');
if (hello) {
   ReactDOM.render(<Hello />, hello);
}