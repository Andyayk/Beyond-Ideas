import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';

var $ = require('jquery');

class Chartbi extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",
         selectedtable: "",
         selectedtable2: "",            
         variablesoptions: "", 
         variablesoptions2: "",
         selectedvariable: "",
         selectedvariable2: "",    
         joinvariable: "",
         joinvariable2: "",  
         scatterplot: "",
         filterstartdate: "",
         filterenddate: "",    
         datevariables: "", 
         datevariables2: "", 
         selecteddatevariable: "",           
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);

      this.createVariables = this.createVariables.bind(this);   
      this.createVariables2 = this.createVariables2.bind(this);  

      this.selectVariable = this.selectVariable.bind(this);   
      this.selectVariable2 = this.selectVariable2.bind(this);  

      this.joinVariable = this.joinVariable.bind(this);   
      this.joinVariable2 = this.joinVariable2.bind(this);    

      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.filterStartDate = this.filterStartDate.bind(this);  
      this.filterEndDate = this.filterEndDate.bind(this); 

      this.createDateVariables = this.createDateVariables.bind(this); 
      this.createDateVariables2 = this.createDateVariables2.bind(this);

      this.selectDateVariable = this.selectDateVariable.bind(this);                        

      this.getMySQLTables(); //retrieving user's uploaded tables
   }

   //retrieving user's uploaded tables
   getMySQLTables() { 
      $.getJSON(window.location.origin + "/mysqltablesbi/", (data) => {
         var mySQLTables = "";
         $.each(data, function(key, val) {
            mySQLTables = val;
         });

         this.createOptions(mySQLTables);                     
      });
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

   //retrieving variables from flask
   getVariables(event) {
      this.setState({
         selectedtable: event.target.value
      });

      $.post(window.location.origin + "/variablesbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var variablelist = data['variablelist'];
         var datevariablelist = data['datevariablelist'];
         
         this.createVariables(variablelist);       
         this.createDateVariables(datevariablelist);   
      });          
   }

   //retrieving variables from flask
   getVariables2(event) {
      this.setState({
         selectedtable2: event.target.value
      });

      $.post(window.location.origin + "/variablesbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var variablelist = data['variablelist'];
         var datevariablelist = data['datevariablelist'];
   
         this.createVariables2(variablelist);         
         this.createDateVariables2(datevariablelist);                       
      });   
   }       

   //creating select options for drop down list based on data from flask
   createVariables(data) {
      let variables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = data.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
         };
      }

      this.setState({
         variablesoptions: variables
      });
   }    

   //creating select options for drop down list based on data from flask
   createVariables2(data) {
      let variables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = data.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
         };
      }

      this.setState({
         variablesoptions2: variables
      });
   }    

   //creating select options for drop down list based on date data from flask
   createDateVariables(data) {
      let datevariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var datevariablelist = data.toString().split(",");
         for (let i = 0; i < datevariablelist.length; i++) {
            datevariables.push(<option value={"t1."+datevariablelist[i]}>1: {datevariablelist[i]}</option>);
         };
      }

      this.setState({
         datevariables: datevariables
      });
   }     

   //creating select options for drop down list based on date data from flask
   createDateVariables2(data) {
      let datevariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var datevariablelist = data.toString().split(",");
         for (let i = 0; i < datevariablelist.length; i++) {
            datevariables.push(<option value={"t2."+datevariablelist[i]}>2: {datevariablelist[i]}</option>);
         };
      }

      this.setState({
         datevariables2: datevariables
      });
   }      

   //store the variable that the user has selected
   selectVariable(event) {
      this.setState({
         selectedvariable: event.target.value
      });      
   }

   //store the variable that the user has selected
   selectVariable2(event) {
      this.setState({
         selectedvariable2: event.target.value
      });      
   }   

   //store the variable that the user has selected
   joinVariable(event) {
      this.setState({
         joinvariable: event.target.value
      });      
   }

   //store the variable that the user has selected
   joinVariable2(event) {
      this.setState({
         joinvariable2: event.target.value
      });      
   } 

   //store the start date that the user has selected
   filterStartDate(event) {
      this.setState({
         filterstartdate: event.target.value
      });      
   } 

   //store the end date that the user has selected
   filterEndDate(event) {
      this.setState({
         filterenddate: event.target.value
      });      
   } 

   //store the date variable that the user has selected
   selectDateVariable(event) {
      this.setState({
         selecteddatevariable: event.target.value
      });      
   }    

   //retrieving chart data from flask and creating chart using plotly
   generateScatterplot(event) {
      $.post(window.location.origin + "/scatterplotdatabi/",
      {
         selectedtable: this.state.selectedtable,
         selectedtable2: this.state.selectedtable2,            
         selectedvariable: this.state.selectedvariable,
         selectedvariable2: this.state.selectedvariable2,    
         joinvariable: this.state.joinvariable,
         joinvariable2: this.state.joinvariable2, 
         filterstartdate: this.state.filterstartdate,
         filterenddate: this.state.filterenddate,
         selecteddatevariable: this.state.selecteddatevariable
      },
      (data) => {
         var xarray = [];
         var yarray = [];
         $.each(data, function(key, val) {
            if(xarray == "") {
               xarray = val.toString().split(",").map(Number);
            } else {
               yarray = val.toString().split(",").map(Number);
            }
         });   

         var twoDArray = [];

         for (var i = 0; i < xarray.length; i++) { //2D array needed for regression calculation only
            twoDArray.push([xarray[i], yarray[i]]);
         }
         
         var result = regression.linear(twoDArray);
         var gradient = result.equation[0];
         var yIntercept = result.equation[1];
         var r2 = result.r2;
         var equation = result.string;

         var predictedyarray = xarray.map(function(x) { return gradient * x + yIntercept; }); //calculating the predicted y values, y = mx+c
         var r = Correlation.calc(xarray, yarray).toFixed(2); //rounding r to 2 decimal place

         var maxY = Math.max(...yarray);
         var minY = Math.min(...yarray);

         this.setState({
            scatterplot: <Plot data={[{
                           x: xarray,
                           y: yarray,
                           type: 'scatter',
                           mode: 'markers',
                           marker: {color: 'blue'},
                           showlegend: false
                           },{
                           x: xarray,
                           y: predictedyarray,
                           type: 'lines',
                           mode: 'lines',
                           marker: {color: 'red'},
                           name: "Equation: " + equation
                           }]}
                           layout={{
                              width: 1000, 
                              height: 900, 
                              title: '<b>Correlation between ' + this.state.selectedvariable + ' and ' + this.state.selectedvariable2 + '</b><br>R: ' + r + ', R-Squared: ' + r2 + ', Min Y: ' + minY + ', Max Y: ' + maxY,
                              hovermode: 'closest',
                              xaxis: {
                                 title: this.state.selectedvariable,
                                 ticklen: 5,
                                 zeroline: false,
                                 gridwidth: 2,
                              },
                              yaxis: {
                                 title: this.state.selectedvariable2,
                                 ticklen: 5,
                                 zeroline: false,
                                 gridwidth: 2,
                              }                          
                           }}
                        />   
         });       
      });    
   }         

   //rendering the html for chart
   render() {
      return (
         <div>
            <table style={{"width":"100%"}}>
               <tr>
                  <td style={{"width":"25%"}} valign="top" align="center" bgcolor="white">      
                     <br />
                     <font size="6"><b>Datasources</b></font>
                     <br /><br />                      
                     <label for="tablelist">Data Source 1:</label>
                     <br /> 
                     <select name="tablelist" onChange={this.getVariables}>
                        <option value="" disabled selected>Select a Table</option>
                        {this.state.options}
                     </select>
                     <br /><br /> 
                     
                     <label for="tablelist2">Data Source 2:</label>        
                     <br />
                     <select name="tablelist2" onChange={this.getVariables2}>
                        <option value="" disabled selected>Select a Table</option>
                        {this.state.options}
                     </select>  
                     
                     <br /><br /><br /><br /> 

                     <font size="6"><b>Variables</b></font>
                     <br /><br />   
                     <label for="variablelist">Variable (X):</label>
                     <br />
                     <select name="variablelist" onChange={this.selectVariable}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variablesoptions}
                     </select>
                     <br /><br />
                     
                     <label for="variablelist2">Variable (Y):</label>        
                     <br />
                     <select name="variablelist2" onChange={this.selectVariable2}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variablesoptions2}
                     </select>     
                     
                     <br /><br /><br /><br /> 
                     
                     <font size="6"><b>Join</b></font>
                     <br /><br />   
                     <label for="variablelist3">Joining Variable From Data Source 1:</label>
                     <br />
                     <select name="variablelist3" onChange={this.joinVariable}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variablesoptions}
                     </select>
                     <br /><br />

                     <label for="variablelist4">Joining Variable From Data Source 2:</label>        
                     <br />
                     <select name="variablelist4" onChange={this.joinVariable2}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variablesoptions2}
                     </select>     

                     <br /><br /><br /><br /> 

                     <font size="6"><b>Filter</b></font>
                     <br /><br />   
                     <label for="filterdatelist">Date Variable:</label> 
                     <br />    
                     <select name="filterdatelist" onChange={this.selectDateVariable}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.datevariables}
                        {this.state.datevariables2}
                     </select>
                     <br /><br />

                     <label for="filterstartdate">Start Date:</label>
                     <br />                     
                        <input type="date" name="filterstartdate" onChange={this.filterStartDate} />
                     <br /><br />     

                     <label for="filterenddate">End Date:</label>
                     <br />                        
                        <input type="date" name="filterenddate" onChange={this.filterEndDate} />                        
                     <br /><br />

                     <button onClick={this.generateScatterplot}>Generate Scatterplot</button>
                     <br /><br />              
                  </td>
                  <td></td>
                  <td align="center" style={{"width":"74%"}} bgcolor="white">
                  {this.state.scatterplot}   
                  </td>
               </tr>
            </table>                      
         </div>
      );
   }
}
export default Chartbi;