import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MUIDataTable from 'mui-datatables';

import "../css/main";

var $ = require('jquery');

class Analysisbi extends Component {  
  constructor() {
    super();
    this.state = {
      options: "",
      options2: "",
      selectedtable: "", 
      selectedtable2: "", 
      tablename: "",            
      hideLoadingBar: true,
      hideLoadingBarTwo: true,      
      barchart: "",
      timeseries: "",
      columns: "",
      values: "",
      tableboolean: false     
    };

    this.getMySQLTables = this.getMySQLTables.bind(this);
    this.selectTable = this.selectTable.bind(this);
    this.selectTable2 = this.selectTable2.bind(this);

    this.trainModel = this.trainModel.bind(this);

    this.barChart = this.barChart.bind(this);
    this.timeSeries = this.timeSeries.bind(this);

    this.generatePlot = this.generatePlot.bind(this); 
    this.generateHistoricalPlot = this.generateHistoricalPlot.bind(this);     
    this.formSubmitted = this.formSubmitted.bind(this);
    this.formSubmitted2 = this.formSubmitted2.bind(this);    

    this.callBackendAPI = this.callBackendAPI.bind(this);

    this.getMySQLTables(); //retrieving user's uploaded tables

    this.loadingBarInstance = (
      <div className="loader"></div>                                   
    ); 

    this.loadingBarInstanceTwo = (
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
    let options2 = [];
    if (data.toString().replace(/\s/g, '').length) { //checking data is not empty       
      var mySQLTables = data.toString().split(",");
      for (let i = 0; i < mySQLTables.length; i++) {
        if(mySQLTables[i].includes("_tweets_w_sentiment")){
          options2.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);
        } else if(mySQLTables[i].includes("_tweets")){
          options.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);          
        }
      };
    }

    this.setState({
      options: options,
      options2: options2      
    });
  }    

  //store the variable that the user has selected
  selectTable(event) {
    this.setState({
      selectedtable: event.target.value
    });      
  }

  //store the variable that the user has selected
  selectTable2(event) {
    this.setState({
      selectedtable2: event.target.value
    });      
  }  

  //this will train the models
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

  //creating bar chart using plotly
  barChart(yData){
    this.setState({
      barchart: <Plot data={[{
                  x: ['Positive','Negative'],
                  y: yData,
                  type: 'bar',
                  marker:{
                    color: ['rgba(123, 239, 178, 1)', 'rgba(222, 45, 38, 0.8)']
                  },
                  name: 'Positive vs Negative Tweets',
                  hoverlabel: {namelength: -1}
                  }]}
                  layout={{
                    width: 600, 
                    height: 500, 
                    title: '<b>Positive vs Negative Tweets</b>',
                    hovermode: 'closest',
                    xaxis: {
                      title: 'Sentiments',
                      ticklen: 5,
                      zeroline: false,
                      gridwidth: 2,
                    },
                    yaxis: {
                      title: 'No. of Tweets',
                      ticklen: 5,
                      zeroline: false,
                      gridwidth: 2,
                    }                          
                  }}
                />
      })
  }

  //creating time series using plotly
  timeSeries(xData, yData, yData2){
    this.setState({    
      timeseries: <Plot data={[{
                  x: xData,
                  y: yData,
                  type: 'scatter',
                  marker: {color: 'rgba(123, 239, 178, 1)'},
                  name: 'Positive Tweets',
                  hoverlabel: {namelength: -1}
                  },{
                  x: xData,
                  y: yData2,
                  type: 'scatter',
                  marker: {color: 'rgba(222, 45, 38, 0.8)'},
                  name: 'Negative Tweets',
                  hoverlabel: {namelength: -1}
                  }]}
                  layout={{
                    width: 600, 
                    height: 500, 
                    title: '<b>Timelime of Tweets</b>',
                    hovermode: 'closest',
                    xaxis: {
                      title: 'Date',
                      ticklen: 5,
                      zeroline: false,
                      gridwidth: 2,
                    },
                    yaxis: {
                      title: 'No. of Tweets',
                      ticklen: 5,
                      zeroline: false,
                      gridwidth: 2,
                    }                          
                  }}
                />
      })
  }

  //retrieving chart data from flask and creating chart using plotly
  generatePlot(event){
    $.post(window.location.origin + "/generateplotbi/",
    {
      selectedtable: this.state.selectedtable   
    },
    (data) => {
      this.barChart(data['aggregatedsentiment']);
      this.timeSeries(['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00'], [1,2,6], [9,5,3]);

      var x = document.getElementById("message");
      x.style.display = "none";

      var x = document.getElementById("message2");
      x.style.display = "none";

      this.setState({                  
        columns: data['columns'],
        values: data['values'],
        hideLoadingBar: true, //hide loading button
        tableboolean: true,
        tablename: this.state.selectedtable                     
      });
    });  
  }      

  //retrieving chart data from flask and creating chart using plotly
  generateHistoricalPlot(event){
    $.post(window.location.origin + "/generatehistoricalplotbi/",
    {
      selectedtable2: this.state.selectedtable2   
    },
    (data) => {    
      this.barChart(data['aggregatedsentiment']);
      this.timeSeries(['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00'], [1,2,6], [9,5,3]);

      var x = document.getElementById("message");
      x.style.display = "none";

      var x = document.getElementById("message2");
      x.style.display = "none";

      this.setState({                  
        columns: data['columns'],
        values: data['values'],
        hideLoadingBarTwo: true, //hide loading button
        tableboolean: true,
        tablename: this.state.selectedtable2                  
      }); 
    });     
  }    

  //handle form submission
  formSubmitted(event){
    event.preventDefault();

    this.setState({
      hideLoadingBar: false
    });  

    this.generatePlot();    
  }  

  //handle form submission 2
  formSubmitted2(event){
    event.preventDefault();

    this.setState({
      hideLoadingBarTwo: false
    });  

    this.generateHistoricalPlot();    
  }           

   //rendering the html for chart
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};
      const style2 = this.state.hideLoadingBarTwo ? {display: 'none'} : {};

      return (
        <div>
          {/*uncomment below to train model*/}
          {/*<button id="submitbutton" onClick={this.trainModel} className="button" type="button" style={{"verticalAlign":"middle"}}>Train Model</button>*/}
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
                      Generate New Analysis
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
                    <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Generate Analysis</button>                             
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center">                                                            
                    <div className="LoadingBar" style={style}>
                      {this.loadingBarInstance}
                    </div>                                
                  </td>
                  </tr>                                 
                </tbody>   
                </table>
                <br/>          
              </form>
              </td>    
              <td style={{"width":"22%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">   
              <form name="submitForm" method="POST" onSubmit={this.formSubmitted2}>                       
                <br />
                <table align="center">
                <tbody>
                  <tr>
                  <td align="center">
                    <div className="cardtitle">
                      View Previous Analysis
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
                    <select required defaultValue="" onChange={this.selectTable2} style={{"width":"210px"}}>
                      <option value="" disabled>---------- select a dataset ----------</option>
                      {this.state.options2}
                    </select>
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center">                                                                              
                    <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>View Analysis</button>                             
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center">                                                            
                    <div className="LoadingBar" style={style2}>
                      {this.loadingBarInstanceTwo}
                    </div>                                
                  </td>
                  </tr>                                 
                </tbody>   
                </table>
                <br/>          
              </form>
              </td>                             
            </tr>
          </tbody>   
          </table>
          
          <table style={{"width":"100%"}}>
          <tbody>                       
            <tr></tr>
            <tr>
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
              <table>
              <tbody>  
                <tr>
                  <td>        
                    {this.state.barchart}
                  </td><td>
                    {this.state.timeseries}  
                  </td>                           
                </tr>
              </tbody>   
              </table>                  
              </td>          
            </tr>
          </tbody>   
          </table>  
          </div>

          <table>
          <tbody>
            <tr>
              <td align="center" style={{"overflow":"auto", "maxWidth":"1000px", "verticalAlign":"top", "align":"center"}}>    
                <div style={{"overflowX":"auto"}}>
                  <table id="message2">
                    <tbody>
                      <tr>
                        <td align="center" style={{"width":"1000px", "height":"500px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                          <label style={{"verticalAlign":"center"}}>Dataset Display Area</label>                                                     
                        </td>                           
                      </tr>
                     </tbody>
                  </table>    
                  <div className="outputtable" style={{"width":"1000px","maxWidth":"1000px"}}>
                    {this.state.tableboolean?(                 
                      <MUIDataTable
                         title={"Dataset: "+this.state.tablename}
                         data={this.state.values}
                         columns={this.state.columns}
                      /> 
                      ):null
                    } 
                  </div> 
                </div>
              </td>
            </tr>
          </tbody>
          </table>                                      
        </div>
      );
   }
}
export default Analysisbi;