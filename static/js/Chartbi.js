import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';
import SpearmanRHO from 'spearman-rho';

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
         selectedjoinvariable: "activitydate", 
         scatterplot: "",
         filterstartdate: "",
         filterenddate: "",    
         datevariables: "", 
         datevariables2: "", 
         selectedfiltervariable: "",       
         companyvariables: "",
         companyvariables2: "",
         depotvariables: "",
         depotvariables2: "",
         geographicallocationvariables: "",
         geographicallocationvariables2: "",
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);

      this.createVariables = this.createVariables.bind(this);   
      this.createVariables2 = this.createVariables2.bind(this);  

      this.selectVariable = this.selectVariable.bind(this);   
      this.selectVariable2 = this.selectVariable2.bind(this);  

      this.selectJoinVariable = this.selectJoinVariable.bind(this);     

      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.filterStartDate = this.filterStartDate.bind(this);  
      this.filterEndDate = this.filterEndDate.bind(this); 

      this.createDateVariables = this.createDateVariables.bind(this); 
      this.createDateVariables2 = this.createDateVariables2.bind(this);

      this.selectFilterVariable = this.selectFilterVariable.bind(this);  

      this.createCompanyVariables = this.createCompanyVariables.bind(this);
      this.createCompanyVariables2 = this.createCompanyVariables2.bind(this);      

      this.createDepotVariables = this.createDepotVariables.bind(this);
      this.createDepotVariables2 = this.createDepotVariables2.bind(this);      
      
      this.createGeographicalLocationVariables = this.createGeographicalLocationVariables.bind(this);  
      this.createGeographicalLocationVariables2 = this.createGeographicalLocationVariables2.bind(this);                                   

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
         var companyvariablelist = data['companyvariablelist'];
         var depotvariablelist = data['depotvariablelist'];
         var geographicallocationvariablelist = data['geographicallocationvariablelist'];         
         
         this.createVariables(variablelist);       
         this.createDateVariables(datevariablelist);   
         this.createCompanyVariables(companyvariablelist); 
         this.createDepotVariables(depotvariablelist); 
         this.createGeographicalLocationVariables(geographicallocationvariablelist);                            
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
         var companyvariablelist = data['companyvariablelist'];
         var depotvariablelist = data['depotvariablelist'];
         var geographicallocationvariablelist = data['geographicallocationvariablelist'];           
   
         this.createVariables2(variablelist);         
         this.createDateVariables2(datevariablelist);  
         this.createCompanyVariables2(companyvariablelist); 
         this.createDepotVariables2(depotvariablelist); 
         this.createGeographicalLocationVariables2(geographicallocationvariablelist);                                     
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

   //creating select options for drop down list based on company data from flask
   createCompanyVariables(data) {
      let companyvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var companyvariablelist = data.toString().split(",");
         for (let i = 0; i < companyvariablelist.length; i++) {
            companyvariables.push(<option value={"t1."+companyvariablelist[i]}>1: {companyvariablelist[i]}</option>);
         };
      }

      this.setState({
         companyvariables: companyvariables
      });
   }     

   //creating select options for drop down list based on company data from flask
   createCompanyVariables2(data) {
      let companyvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var companyvariablelist = data.toString().split(",");
         for (let i = 0; i < companyvariablelist.length; i++) {
            companyvariables.push(<option value={"t2."+companyvariablelist[i]}>2: {companyvariablelist[i]}</option>);
         };
      }

      this.setState({
         companyvariables2: companyvariables
      });
   }      

   //creating select options for drop down list based on company data from flask
   createDepotVariables(data) {
      let depotvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var depotvariablelist = data.toString().split(",");
         for (let i = 0; i < depotvariablelist.length; i++) {
            depotvariables.push(<option value={"t1."+depotvariablelist[i]}>1: {depotvariablelist[i]}</option>);
         };
      }

      this.setState({
         depotvariables: depotvariables
      });
   }     

   //creating select options for drop down list based on company data from flask
   createDepotVariables2(data) {
      let depotvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var depotvariablelist = data.toString().split(",");
         for (let i = 0; i < depotvariablelist.length; i++) {
            depotvariables.push(<option value={"t2."+depotvariablelist[i]}>2: {depotvariablelist[i]}</option>);
         };
      }

      this.setState({
         depotvariables2: depotvariables
      });
   }     

   //creating select options for drop down list based on company data from flask
   createGeographicalLocationVariables(data) {
      let geographicallocationvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var geographicallocationvariablelist = data.toString().split(",");
         for (let i = 0; i < geographicallocationvariablelist.length; i++) {
            geographicallocationvariables.push(<option value={"t1."+geographicallocationvariablelist[i]}>1: {geographicallocationvariablelist[i]}</option>);
         };
      }

      this.setState({
         geographicallocationvariables: geographicallocationvariables
      });
   }     

   //creating select options for drop down list based on company data from flask
   createGeographicalLocationVariables2(data) {
      let geographicallocationvariables = [];
      if (data.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var geographicallocationvariablelist = data.toString().split(",");
         for (let i = 0; i < geographicallocationvariablelist.length; i++) {
            geographicallocationvariables.push(<option value={"t2."+geographicallocationvariablelist[i]}>2: {geographicallocationvariablelist[i]}</option>);
         };
      }

      this.setState({
         geographicallocationvariables2: geographicallocationvariables
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
   selectJoinVariable(event) {
      this.setState({
         selectedjoinvariable: event.target.value
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

   //store the filter variable that the user has selected
   selectFilterVariable(event) {
      this.setState({
         selectedfiltervariable: event.target.value
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
         selectedjoinvariable: this.state.selectedjoinvariable,
         filterstartdate: this.state.filterstartdate,
         filterenddate: this.state.filterenddate,
         selectedfiltervariable: this.state.selectedfiltervariable
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

         var spearmanrho = new SpearmanRHO(xarray, yarray);

         spearmanrho.calc()
           .then(rho =>

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
                              title: '<b>Correlation between ' + this.state.selectedvariable + ' and ' + this.state.selectedvariable2 + '</b><br>R: ' + r + ', Rho: ' + rho.toFixed(2) + ', R-Squared: ' + r2 + ', Min Y: ' + minY + ', Max Y: ' + maxY,
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
            }))
           .catch(err => console.error(err));       
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
                     <font size="6"><b>Datasets</b></font>
                     <br /><br />                      
                     <label for="tablelist">Dataset 1 (X):</label>
                     <br /> 
                     <select name="tablelist" onChange={this.getVariables}>
                        <option value="" disabled selected>Select a Table</option>
                        {this.state.options}
                     </select>
                     <br /><br /> 
                     
                     <label for="tablelist2">Dataset 2 (Y):</label>        
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
                     
                     <font size="6"><b>Combine Datasets</b></font>
                     <br /><br />   
                     <label for="joinvariable">Combine Based On:</label>
                     <br />
                     <form>
                     <input type="radio" name="joinvariable" value="activitydate" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/>Activity Date
                     <br />
                     <input type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/>Company
                     <br />                  
                     <input type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/>Depot
                     <br />
                     <input type="radio" name="joinvariable" value="geographicallocation" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"}/>Geographical Location
                     </form>

                     <br /><br /><br /><br /> 

                     <font size="6"><b>Filter</b></font>
                     <br /><br />   
                     <label for="filterlist">Filtering By:</label> 
                     <br />    
                     <select name="filterlist" onChange={this.selectFilterVariable}>
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.datevariables}
                        {this.state.companyvariables}               
                        {this.state.depotvariables}                 
                        {this.state.geographicallocationvariables}
                        <option value="" disabled>---------------------------------</option>                                                                
                        {this.state.datevariables2}
                        {this.state.companyvariables2}              
                        {this.state.depotvariables2}                
                        {this.state.geographicallocationvariables2}                                              
                     </select>
                     <br /><br />

                     {this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                        <div>
                           <label for="filterstartdate">Start Date:</label>
                           <br />                     
                           <input type="date" name="filterstartdate" onChange={this.filterStartDate} />
                           <br /><br />

                           <label for="filterenddate">End Date:</label>
                           <br />
                           <input type="date" name="filterenddate" onChange={this.filterEndDate} />
                           <br /><br />
                        </div>
                     }

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