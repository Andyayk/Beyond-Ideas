import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// BEYOND IDEAS ----
import TableViewbi from './TableViewbi';
import Chartbi from './Chartbi';
import AutoChartbi from './AutoChartbi';
import WebCrawlingbi from './WebCrawlingbi';
import TwitterCrawlingbi from './TwitterCrawlingbi';
import Analysisbi from './Analysisbi';
import StockCrawlingbi from './StockCrawlingbi';


// PANDACONDA ----
import App from "./App";
import HomeContent from "./HomeContent";
import UploadContent from "./UploadContent";
import VisualisationContent from "./VisualisationContent";
import Signup from "./Signup";
import EditTable from "./EditTable"
import Manage from "./Manage"

// COMMON ---
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

const managePage = document.getElementById("managePage");
if (managePage) {
  ReactDOM.render(<Manage />, managePage);
}

const datasetsPage = document.getElementById("datasetsPage");
if (datasetsPage) {
  ReactDOM.render(<Datasets />, datasetsPage);
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

const autochartbi = document.getElementById('autochartbi');
if (autochartbi) {
   ReactDOM.render(<AutoChartbi />, autochartbi);
}

const webcrawlingbi = document.getElementById('webcrawlingbi');
if (webcrawlingbi) {
   ReactDOM.render(<WebCrawlingbi />, webcrawlingbi);
}

const twittercrawlingbi = document.getElementById('twittercrawlingbi');
if (twittercrawlingbi) {
   ReactDOM.render(<TwitterCrawlingbi />, twittercrawlingbi);
}

const analysisbi = document.getElementById('analysisbi');
if (analysisbi) {
   ReactDOM.render(<Analysisbi />, analysisbi);
}

const stockcrawlingbi = document.getElementById('stockcrawlingbi');
if (stockcrawlingbi) {
   ReactDOM.render(<StockCrawlingbi />, stockcrawlingbi);
}