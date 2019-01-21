import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';
import SpearmanRHO from 'spearman-rho';

import "../main";

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
         selectedfiltervalue: "",
         selectedfiltervalue2: "",    
         datevariablesoptions: "", 
         datevariablesoptions2: "", 
         selectedfiltervariable: "",       
         companyvariablesoptions: "",
         companyvariablesoptions2: "",
         depotvariablesoptions: "",
         depotvariablesoptions2: "",
         geographicallocationvariablesoptions: "",
         geographicallocationvariablesoptions2: "",
         companyvaluelistoptions: "",
         companyvaluelistoptions2: "",
         depotvaluelistoptions: "",
         depotvaluelistoptions2: "", 
         geographicallocationvaluelistoptions: "",
         geographicallocationvaluelistoptions2: "",                            
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);

      this.createVariables = this.createVariables.bind(this);   
      this.createVariablesOptions = this.createVariablesOptions.bind(this);

      this.selectVariable = this.selectVariable.bind(this);   
      this.selectVariable2 = this.selectVariable2.bind(this);  
      this.selectJoinVariable = this.selectJoinVariable.bind(this);     
      this.selectFilterVariable = this.selectFilterVariable.bind(this); 
      this.selectFilterValue = this.selectFilterValue.bind(this);  
      this.selectFilterValue2 = this.selectFilterValue2.bind(this);  

      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.getMySQLTables(); //retrieving user's uploaded tables
   }

   //retrieving user's uploaded tables
   getMySQLTables() { 
      $.getJSON(window.location.origin + "/mysqltablesbi/", (data) => {
         var mySQLTables = "";
         $.each(data, function(key, val) {
            mySQLTables = val;
         });  

         //creating select options for drop down list based on data from flask
         let options = [];
         if (mySQLTables.toString().replace(/\s/g, '').length) { //checking data is not empty       
            var mySQLTables = mySQLTables.toString().split(",");
            for (let i = 0; i < mySQLTables.length; i++) {
               options.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);
            };
         }

         this.setState({
            options: options
         });                        
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
         var methodNo = 1;
         var variablelistdata = data['variablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var geographicallocationvariablelistdata = data['geographicallocationvariablelist']; 

         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var geographicallocationvaluelistdata = data['geographicallocationvaluelist'];                
         
         this.createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, geographicallocationvariablelistdata, companyvaluelistdata, depotvaluelistdata, geographicallocationvaluelistdata);                     
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
         var methodNo = 2;         
         var variablelistdata = data['variablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var geographicallocationvariablelistdata = data['geographicallocationvariablelist'];         

         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var geographicallocationvaluelistdata = data['geographicallocationvaluelist'];  
         
         this.createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, geographicallocationvariablelistdata, companyvaluelistdata, depotvaluelistdata, geographicallocationvaluelistdata);                     
      });  
   }       

   //general method for creating select options for drop down list based on data from flask
   createVariablesOptions(methodNo, variablelistdata) {
      let variables = [];
      if (variablelistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = variablelistdata.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={"t"+methodNo+"."+variablelist[i]}>{methodNo+": "+variablelist[i]}</option>);
         };
      }      
      return variables;
   }

   //creating select options for drop down list based on data from flask
   createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, geographicallocationvariablelistdata, companyvaluelistdata, depotvaluelistdata, geographicallocationvaluelistdata) {
      let variables = [];
      if (variablelistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = variablelistdata.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
         };
      }

      //creating select options for drop down list based on date data variables from flask
      let datevariables = this.createVariablesOptions(methodNo, datevariablelistdata);

      //creating select options for drop down list based on company data variables from flask
      let companyvariables = this.createVariablesOptions(methodNo, companyvariablelistdata);

      //creating select options for drop down list based on depot data variables from flask
      let depotvariables = this.createVariablesOptions(methodNo, depotvariablelistdata);

      //creating select options for drop down list based on geographical location data variables from flask
      let geographicallocationvariables = this.createVariablesOptions(methodNo, geographicallocationvariablelistdata);

      //creating select options for drop down list based on company data values from flask
      let companyvalues = this.createVariablesOptions(methodNo, companyvaluelistdata);

      //creating select options for drop down list based on depot data values from flask
      let depotvalues = this.createVariablesOptions(methodNo, depotvaluelistdata);

      //creating select options for drop down list based on geographical location data values from flask
      let geographicallocationvalues = this.createVariablesOptions(methodNo, geographicallocationvaluelistdata);      

      if (methodNo == 1) {
         this.setState({
            variablesoptions: variables,
            datevariablesoptions: datevariables,
            companyvariablesoptions: companyvariables,
            depotvariablesoptions: depotvariables,
            geographicallocationvariablesoptions: geographicallocationvariables,
            companyvaluelistoptions: companyvalues,
            depotvaluelistoptions: depotvalues,
            geographicallocationvaluelistoptions: geographicallocationvalues             
         });        
      } else if (methodNo == 2) {
         this.setState({
            variablesoptions2: variables,
            datevariablesoptions2: datevariables,
            companyvariablesoptions2: companyvariables,
            depotvariablesoptions2: depotvariables,
            geographicallocationvariablesoptions2: geographicallocationvariables,
            companyvaluelistoptions2: companyvalues,
            depotvaluelistoptions2: depotvalues,  
            geographicallocationvaluelistoptions2: geographicallocationvalues                        
         });           
      }   
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

   //store the filter variable that the user has selected
   selectFilterVariable(event) {
      this.setState({
         selectedfiltervariable: event.target.value
      });      
   }    

   //store the filter values that the user has selected
   selectFilterValue(event) {
      this.setState({
         selectedfiltervalue: event.target.value
      });      
   } 

   //store the  filter values 2 (if any) that the user has selected
   selectFilterValue2(event) {
      this.setState({
         selectedfiltervalue2: event.target.value
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
         selectedfiltervalue: this.state.selectedfiltervalue,
         selectedfiltervalue2: this.state.selectedfiltervalue2,
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
                        {this.state.datevariablesoptions}
                        {this.state.companyvariablesoptions}               
                        {this.state.depotvariablesoptions}                 
                        {this.state.geographicallocationvariablesoptions}
                        <option value="" disabled>---------------------------------</option>                                                                
                        {this.state.datevariablesoptions2}
                        {this.state.companyvariablesoptions2}              
                        {this.state.depotvariablesoptions2}                
                        {this.state.geographicallocationvariablesoptions2}                                              
                     </select>
                     <br /><br />

                     {this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                        <div>
                           <label for="filterstartdate">Start Date:</label>
                           <br />                     
                           <input type="date" name="filterstartdate" onChange={this.selectFilterValue} />
                           <br /><br />

                           <label for="filterenddate">End Date:</label>
                           <br />
                           <input type="date" name="filterenddate" onChange={this.selectFilterValue2} />
                           <br /><br />
                        </div>
                     }
                     {this.state.selectedfiltervariable.toLowerCase().includes("company") &&
                        <div>
                           <label for="filtercompany">Company:</label>
                           <br />
                           <select name="filtercompany" onChange={this.selectFilterValue}>
                              <option value="" disabled selected>Select a Variable</option>
                              {this.state.companyvaluelistoptions}                         
                              <option value="" disabled>---------------------------------</option>   
                              {this.state.companyvaluelistoptions2}
                           </select>
                           <br /><br />
                        </div>
                     }
                     {this.state.selectedfiltervariable.toLowerCase().includes("depot") &&
                        <div>
                           <label for="filterdepot">Depot:</label>
                           <br />
                           <select name="filterdepot" onChange={this.selectFilterValue}>
                              <option value="" disabled selected>Select a Variable</option>
                              {this.state.depotvaluelistoptions}                            
                              <option value="" disabled>---------------------------------</option>   
                              {this.state.depotvaluelistoptions2}                           
                           </select>
                           <br /><br />
                        </div>
                     }
                     {this.state.selectedfiltervariable.toLowerCase().includes("geographicallocation") &&
                        <div>
                           <label for="filtergeographicallocation">Geographical Location:</label>
                           <br />
                           <select name="filtergeographicallocation" onChange={this.selectFilterValue}>
                              <option value="" disabled selected>Select a Variable</option>
                              {this.state.geographicallocationvaluelistoptions}                           
                              <option value="" disabled>---------------------------------</option>   
                              {this.state.geographicallocationvaluelistoptions2}                              
                           </select>
                           <br /><br />
                        </div>
                     }                                                               

                     <button class="button" style={{"vertical-align":"middle"}} onClick={this.generateScatterplot}><span>Generate Scatterplot</span></button>
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