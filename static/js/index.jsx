import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import TableViewbi from './TableViewbi';
import Chartbi from './Chartbi';
import WebCrawlingbi from './WebCrawlingbi';
import TestingTwitterCrawlingbi from './TestingTwitterCrawlingbi';
import App from "./App";
import HomeContent from "./HomeContent";
import UploadContent from "./UploadContent";
import VisualisationContent from "./VisualisationContent";
import Signup from "./Signup";
import EditTable from "./EditTable";
import "babel-polyfill";

require('../css/main.css');

// ========================================================= Panda Conda Classes START HERE ================================================

const loginPage = document.getElementById("loginPage");
if (loginPage) {
  ReactDOM.render(<App />, loginPage);
}

const homePage = document.getElementById("homePage");
if (homePage) {
  ReactDOM.render(<HomeContent />, homePage);
}

const uploadPage = document.getElementById("uploadPage");
if (uploadPage) {
  ReactDOM.render(<UploadContent />, uploadPage);
}

const visualisationPage = document.getElementById("visualisationPage");
if (visualisationPage) {
  ReactDOM.render(<VisualisationContent />, visualisationPage);
}

const signupPage = document.getElementById("signupPage");
if (signupPage) {
  ReactDOM.render(<Signup />, signupPage);
}

const tablePage = document.getElementById("tablePage");
if (tablePage) {
  ReactDOM.render(<EditTable />, tablePage);
}

// ========================================================= Beyond Ideas Classes START HERE ================================================

const tableviewbi = document.getElementById('tableviewbi');
if (tableviewbi) {
   ReactDOM.render(<TableViewbi />, tableviewbi);
}

const chartbi = document.getElementById('chartbi');
if (chartbi) {
   ReactDOM.render(<Chartbi />, chartbi);
}

const webcrawlingbi = document.getElementById('webcrawlingbi');
if (webcrawlingbi) {
   ReactDOM.render(<WebCrawlingbi />, webcrawlingbi);
}

const testingtwittercrawlingbi = document.getElementById('testingtwittercrawlingbi');
if (testingtwittercrawlingbi) {
   ReactDOM.render(<TestingTwitterCrawlingbi />, testingtwittercrawlingbi);
}
