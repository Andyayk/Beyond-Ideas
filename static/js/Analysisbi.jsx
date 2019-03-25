import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import WordCloud from 'react-d3-cloud'
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MUIDataTable from 'mui-datatables';

import "../css/main";

var $ = require('jquery');

class Analysisbi extends Component {  

  constructor() {
    super();
    this.state = {
      options: "",
      selectedtable: "", 
      tablename: "",            
      hideLoadingBar: true,    
      barchart: "",
      columns: "",
      values: "",
      tableboolean: false,
      tableboolean: false,
      topiccolumns: "",
      topicvalues: "",
      topwords_positive: "",
      topwords_negative: "",
      positivewordcloud: "",
      negativewordcloud: "",      
      fontSizeMapper: word => Math.log2(word.value) * 15,
      rotate: word => 10
    };

    this.getMySQLTables = this.getMySQLTables.bind(this);
    this.selectTable = this.selectTable.bind(this);

    this.trainModel = this.trainModel.bind(this);

    this.barChart = this.barChart.bind(this);

    this.generatePlot = this.generatePlot.bind(this); 

    this.generateWordCloud = this.generateWordCloud.bind(this);
   
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
        if(mySQLTables[i].includes("_tweets_w_sentiment")){
          
        } else if(mySQLTables[i].includes("_tweets")){
          options.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);          
        }
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

  //retrieving chart data from flask and creating chart using plotly
  generatePlot(event){
    $.post(window.location.origin + "/generateplotbi/",
    {
      selectedtable: this.state.selectedtable   
    },
    (data) => {
      this.barChart(data['aggregatedsentiment']);

      var x = document.getElementById("message");
      x.style.display = "none";

      var x = document.getElementById("message2");
      x.style.display = "none";

      var x = document.getElementById("message3");
      x.style.display = "none";

      this.setState({                  
        columns: data['columns'],
        values: data['values'],
        topiccolumns: data['topiccolumns'],
        topicvalues: data['topicvalues'],
        topwords_positive: data['topwords_positive'],
        topwords_negative: data['topwords_negative'],
        hideLoadingBar: true, //hide loading button
        tableboolean: true,
        tableboolean2: true,
        tablename: this.state.selectedtable           
      });
      this.generateWordCloud(); 
    });  
  }

  generateWordCloud(){
    let textdataPositive = [];
    let textdataNegative = [];
      // {text:'first',value:200},
      // {text:'second',value:100},

    let topwords_positive = this.state.topwords_positive;
    let topwords_negative = this.state.topwords_negative;
    
    for (let i = 0; i < topwords_positive.length; i++) {
      let topword_positive = topwords_positive[i][0];
      let topword_fdist= topwords_positive[i][1];
      textdataPositive.push({'text':topword_positive,'value':topword_fdist});
    }

    for (let i = 0; i < topwords_negative.length; i++) {
      let topword_negative = topwords_negative[i][0];
      let topword_fdist= topwords_negative[i][1]*20;
      textdataNegative.push({'text':topword_negative,'value':topword_fdist});
    }

    this.setState({
      positivewordcloud: <WordCloud
                          data={textdataPositive}
                          fontSizeMapper={this.state.fontSizeMapper}
                          rotate={this.state.rotate}
                         />,
      negativewordcloud: <WordCloud
                          data={textdataNegative}
                          fontSizeMapper={this.state.fontSizeMapper}
                          rotate={this.state.rotate}
                         />
    })
  }      

  //handle form submission
  formSubmitted(event){
    event.preventDefault();

    this.setState({
      hideLoadingBar: false
    });  

    this.generatePlot();   
  }  

   //rendering the html for chart
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};

      return (
        <div>
          {/*uncomment below to train model*/}
          {/*<button id="submitbutton" onClick={this.trainModel} className="button" type="button" style={{"verticalAlign":"middle"}}>Train Model</button>*/}
          <div className="content">
          <table style={{"width":"100%"}}>
          <tbody>
            <tr>
              <td style={{"width":"22%", "height":"240px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">   
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
                  </tr><tr>
                  </tr><tr>
                  </tr><tr>                      
                  <td align="center">                                                                              
                    <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Generate Analysis</button>                             
                  </td>
                  </tr><tr>              
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
                <td align="center" style={{"width":"1000px", "height":"580px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
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
                  </td>
                  <td align="center" style={{"overflow":"auto", "maxWidth":"600", "verticalAlign":"top", "align":"center"}}>    
                    <div style={{"overflowX":"auto"}}>
                      <div className="outputtable" style={{"width":"600","maxWidth":"600"}}>
                        {this.state.tableboolean2?(                 
                          <MUIDataTable
                             title={"Topic Analysis"}
                             data={this.state.topicvalues}
                             columns={this.state.topiccolumns}
                             options={{
                               rowsPerPage:5 , 
                               rowsPerPageOptions: [5,10,15]
                             }}
                          /> 
                          ):null
                        } 
                      </div> 
                    </div>
                  </td>                     
                </tr>
              </tbody>   
              </table>                  
              </td>          
            </tr>
          </tbody>   
          </table>  
          </div>

          <table style={{"width":"100%"}}>
          <tbody>                       
            <tr></tr>
            <tr>
              <td align="center" style={{"width":"80%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"10px"}} bgcolor="white">
              <table id="message3">
              <tbody>
                <tr>
                <td align="center" style={{"width":"1000px", "height":"580px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                  <label style={{"verticalAlign":"center"}}>Word Cloud Display Area</label>          
                </td>                           
                </tr>
              </tbody>   
              </table> 
              <table>
              <tbody>  
                <tr>
                  <td align="center">   
                    <h1>
                      Most common words in<span style={{"color":"#4CAF50"}}> positive tweets</span>
                    </h1>     
                    <br/>
                    {this.state.positivewordcloud}
                  </td>  
                  <td align="center">    
                    <h1>
                      Most comon words in<span style={{"color":"red"}}> negative tweets</span>
                    </h1>
                    <br/>
                    {this.state.negativewordcloud}
                  </td>            
                </tr>
              </tbody>   
              </table>                  
              </td>          
            </tr>
          </tbody>   
          </table>  

          <table>
          <tbody>
            <tr>
              <td style={{"width":"22%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "paddingTop":"15px", "paddingBottom":"15px", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">   
                <div style={{"overflowX":"auto"}}>
                  <table id="message2">
                    <tbody>
                      <tr>
                        <td align="center" style={{"width":"1000px", "height":"580px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                          <label style={{"verticalAlign":"center"}}>Dataset Display Area</label>                                                     
                        </td>                           
                      </tr>
                     </tbody>
                  </table>    
                  <div className="outputtable" style={{"width":"1000px","maxWidth":"1100px"}}>
                    {this.state.tableboolean?(                 
                      <MUIDataTable
                         title={"Dataset: "+this.state.tablename}
                         data={this.state.values}
                         columns={this.state.columns}
                         options={{
                           rowsPerPageOptions: [10,15,20]
                         }}
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