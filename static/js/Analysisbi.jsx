import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';

import "../css/main";

var $ = require('jquery');

class Analysisbi extends Component {  
  constructor() {
    super();
    this.state = {
      options: "",
      selectedtable: "",      
      selectedtable: "",
      hideLoadingBar: true,
      plot: ""                 
    };

    this.getMySQLTables = this.getMySQLTables.bind(this);
    this.selectTable = this.selectTable.bind(this);

    this.trainModel = this.trainModel.bind(this);
    this.generatePlot = this.generatePlot.bind(this); 
    this.formSubmitted = this.formSubmitted.bind(this);

    this.callBackendAPI = this.callBackendAPI.bind(this);

    this.getMySQLTables(); //retrieving user's uploaded tables

    this.loadingBarInstance = (
      <div className="loader"></div>                                   
    );    
  }

  //retrieving user's uploaded tables   
  getMySQLTables() {
    var mySQLTables = "";
    this.callBackendAPI("/get_all_dataset_api")
    .then(res => {
      // console.log(res);
      // console.log(res.datasetNames);
      // this.setState({ datasetNames: res.datasets });
      var datasetNames = res.datasetNames;
      var mySQLTables = [];
      datasetNames.map((datasetName, key) =>
        mySQLTables.push(datasetName.name)
      );
      // console.log(mySQLTables);
      this.createOptions(mySQLTables);
    })
  }

  // GET METHOD CALL
  async callBackendAPI(url) {
    const response = await fetch(url);
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  }   

  //creating select options for drop down list based on data from flask
  createOptions(data) {
    let options = [];
    if (data.toString().replace(/\s/g, '').length) { //checking data is not empty       
      var mySQLTables = data.toString().split(",");
      for (let i = 0; i < mySQLTables.length; i++) {
        options.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);
      };
    }

    this.setState({
      options: options
    });
  }    

  //store the variable that the user has selected
  selectTable(event) {
    this.setState({
      selectedtable: event.target.value
    });      
  }

  //retrieving chart data from flask and creating chart using plotly
  trainModel(event) {
    this.setState({
      hideLoadingBar: false
    });      
    $.post(window.location.origin + "/twittertrain/",
    {
      selectedtable: this.state.selectedtable   
    },
    (data) => {
      this.setState({
        hideLoadingBar: true //hide loading button             
      })      
    });    
  }  

  //retrieving chart data from flask and creating chart using plotly
  generatePlot(event) {
    $.post(window.location.origin + "/twittertest/",
    {
      selectedtable: this.state.selectedtable   
    },
    (data) => {
      this.setState({
        plot: data['message'],
        hideLoadingBar: true //hide loading button             
      })      
    });    
  }        

  //handle form submission
  formSubmitted(event){
    event.preventDefault();
    this.generatePlot();

    this.setState({
      hideLoadingBar: false
    });      
  }        

   //rendering the html for chart
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};

      return (
        <div>
          <div className="content">
          <table style={{"width":"100%"}}>
          <tbody>
            <tr>             
              <td style={{"width":"22%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">   
              <form name="submitForm" method="POST" onSubmit={this.formSubmitted}>                       
                <br />
                <table align="center">
                <tbody>
                  <tr>
                  <td align="center">
                    <div className="cardtitle">
                      Select Dataset
                    </div>
                  </td>
                  </tr><tr>
                  <td align="center">
                    <div className="cardsubtitle">
                      Dataset:
                    </div>
                  </td>
                  </tr><tr>
                  <td align="center">
                    <select required defaultValue="" onChange={this.selectTable} style={{"width":"210px"}}>
                      <option value="" disabled>---------- select a dataset ----------</option>
                      {this.state.options}
                    </select>
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center">   
                    <button id="submitbutton" onClick={this.trainModel} className="button" type="button" style={{"verticalAlign":"middle"}}>Train Model</button>                                                                           
                    <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Test Model</button>                             
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center">                                                            
                    <div className="LoadingBar" style={style}>
                      {this.loadingBarInstance}
                    </div>                     
                    Will print in command prompt             
                  </td>
                  </tr>                                 
                </tbody>   
                </table>
                <br/>          
              </form>                   
              </td>
              <td></td>
              <td align="center" style={{"width":"80%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"10px"}} bgcolor="white">
              <table id="message">
              <tbody>
                <tr>
                <td align="center" style={{"width":"850px", "height":"580px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                  <label style={{"verticalAlign":"center"}}>Plot Display Area</label>          
                </td>                           
                </tr>
              </tbody>   
              </table>           
              {this.state.plot}   
              </td>
            </tr>
          </tbody>   
          </table>  
          </div>                                 
        </div>
      );
   }
}
export default Analysisbi;