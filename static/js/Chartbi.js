import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';
import SpearmanRHO from 'spearman-rho';

import "../css/main";

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
         selectedjoinvariable: "", 
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
         errorstatement: "",
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
      
      this.checkradiobutton = this.checkradiobutton.bind(this);
      this.checksubmitbutton = this.checksubmitbutton.bind(this);
      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

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

   checkradiobutton(datavariable1, datavariable2, radiobutton, labelnames){
      if (datavariable1.toString().replace(/\s/g, '').length && datavariable2.toString().replace(/\s/g, '').length){
         document.getElementById(radiobutton).disabled = false; 
         document.getElementById(labelnames).style = "color:black";
      } else {
         document.getElementById(radiobutton).disabled = true;
         document.getElementById(labelnames).style = "color:#a3a3a3";         
      }
   }
   checksubmitbutton(radiobutton1, radiobutton2, radiobutton3, radiobutton4, table){
      if (document.getElementById(radiobutton1).disabled && document.getElementById(radiobutton2).disabled && document.getElementById(radiobutton3).disabled && document.getElementById(radiobutton4).disabled && table != ""){
         document.getElementById("submitbutton").disabled = true;
         var element = document.getElementById('submitbutton');
            element.style.background = "red";
            element.style.opacity = "0.6";
            element.style.cursor = "not-allowed";

         this.setState({
            errorstatement: "Datasets doesn't contain matching columns describing the following options"
         });
      } else{
         document.getElementById("submitbutton").disabled = false;
         var element = document.getElementById('submitbutton');
            element.style.background = "#4CAF50";
            element.style.opacity = "1";            
            element.style.cursor = "pointer";

         this.setState({
            errorstatement: ""
         });
      }
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
         var allvariablelistdata = data['allvariablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var geographicallocationvariablelistdata = data['geographicallocationvariablelist']; 
         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var geographicallocationvaluelistdata = data['geographicallocationvaluelist'];                
         
         this.checkradiobutton(datevariablelistdata, this.state.datevariablesoptions2, "dateradio", "labeldate")
         this.checkradiobutton(companyvariablelistdata, this.state.companyvariablesoptions2, "companyradio", "labelcompany");
         this.checkradiobutton(depotvariablelistdata, this.state.depotvariablesoptions2, "depotradio", "labeldepot");
         this.checkradiobutton(geographicallocationvaluelistdata, this.state.geographicallocationvariablesoptions2, "locationradio","labelcountry");

         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.selectedtable2);         
         
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
         var allvariablelistdata = data['allvariablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var geographicallocationvariablelistdata = data['geographicallocationvariablelist'];         

         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var geographicallocationvaluelistdata = data['geographicallocationvaluelist'];  
         
         
         this.checkradiobutton(datevariablelistdata, this.state.datevariablesoptions, "dateradio", "labeldate");
         this.checkradiobutton(companyvariablelistdata, this.state.companyvariablesoptions, "companyradio", "labelcompany");
         this.checkradiobutton(depotvariablelistdata, this.state.depotvariablesoptions, "depotradio", "labeldepot");
         this.checkradiobutton(geographicallocationvaluelistdata, this.state.geographicallocationvariablesoptions, "locationradio", "labelcountry");

         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.selectedtable);         

         
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
   createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, geographicallocationvariablelistdata, companyvaluelistdata, depotvaluelistdata, geographicallocationvaluelistdata, allvariablelistdata) {
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
            geographicallocationvaluelistoptions: geographicallocationvalues,
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
            geographicallocationvaluelistoptions2: geographicallocationvalues,            
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

      $.post(window.location.origin + "/filtervariablebi/",
      {
         selectedfiltervariable: event.target.value,
         tablename: this.state.selectedtable,
         tablename2: this.state.selectedtable2
      },
      (data) => {
 
         var filtervalueslistdata = data['filtervalueslist']
         let filtervalues = []
         if (filtervalueslistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
             var variablelist = filtervalueslistdata.toString().split(",");
             for (let i = 0; i < variablelist.length; i++) {
                filtervalues.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
             };
         }
         
         this.setState({
             filtervaluelistoptions: filtervalues
         });
                             
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
         var plotpointname = "";

         if (this.state.selectedfiltervariable.toLowerCase().includes("date")) {
            plotpointname = "Filter: " + this.state.selectedfiltervalue + " to " + this.state.selectedfiltervalue2;
         } else if (this.state.selectedfiltervariable != "") {
            plotpointname = "Filter: " + this.state.selectedfiltervalue;
         }
            
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
                           name: plotpointname,
                           hoverlabel: {namelength: -1}
                           },{
                           x: xarray,
                           y: predictedyarray,
                           type: 'lines',
                           mode: 'lines',
                           marker: {color: 'red'},
                           name: "Equation: " + equation,
                           hoverlabel: {namelength: -1}                          
                           }]}
                           layout={{
                              width: 800, 
                              height: 700, 
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

   //handle form submission
   formSubmitted(event){
      var x = document.getElementById("message");
         x.style.display = "none";

      event.preventDefault();
      this.generateScatterplot();
   }        

   //rendering the html for chart
   render() {
      return (
         <div>
            <div class="content">
            <table style={{"width":"100%"}}>
               <tr>             
                  <td style={{"width":"22%", "box-shadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "border-radius":"12px"}} valign="top" align="center" bgcolor="white">   
                  <form method="POST" onSubmit={this.formSubmitted}>                       
                     <br />
                     <table align="center">
                        <tr>
                           <td align="center">
                              <div class="cardtitle">
                                 Select Datasets
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <div class="cardsubtitle">
                                 Dataset One:
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <select required onChange={this.getVariables}>
                                 <option value="" disabled selected>---------- select a dataset ----------</option>
                                 {this.state.options}
                              </select>
                           </td>
                        </tr><tr>
                           <td align="center">                        
                              <div class="cardsubtitle">
                                 Dataset Two:
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">                                                
                              <select required onChange={this.getVariables2}>
                                 <option value="" disabled selected>---------- select a dataset ----------</option>
                                 {this.state.options}
                              </select>
                           </td>
                        </tr><tr>
                           <td align="center">                  
                              <div class="carderrormsg">
                                 {this.state.errorstatement}
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <div class="cardsubtitle">
                                 Combine both datasets based on:
                              </div>
                           </td>
                        </tr><tr>
                           <table align="center">
                              <tr>                        
                                 <td><input id="dateradio" type="radio" name="joinvariable" value="activitydate" required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"} disabled required/></td><td><label id="labeldate">Activity Date</label></td>
                              </tr><tr>
                                  <td><input id="companyradio" type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"} disabled required/></td><td><label id ="labelcompany">Company</label></td>
                              </tr><tr>
                                 <td><input id="locationradio" type="radio" name="joinvariable" value="geographicallocation" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"} disabled required/></td><td><label id="labelcountry">Country Name</label></td>
                              </tr><tr>                  
                                 <td><input id="depotradio" type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"} disabled required/></td><td><label id="labeldepot">Depot</label></td>                  
                              </tr>
                           </table>
                        </tr>
                        <br/>
                        <tr>
                           <td align="center">                           
                              <div class="cardtitle">
                                 Select Variables
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <div class="cardsubtitle">
                                 Independent Variable (X):
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <select required onChange={this.selectVariable}>
                                 <option value="" disabled selected>---------- select a variable ----------</option>
                                 {this.state.variablesoptions}
                              </select>
                           </td>
                        </tr><tr>
                           <td align="center">                        
                              <div class="cardsubtitle">
                                 Dependent Variable (Y):
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <select required onChange={this.selectVariable2}>
                                 <option value="" disabled selected>---------- select a variable ----------</option>
                                 {this.state.variablesoptions2}
                              </select>
                           </td>
                        </tr>
                        <br/>
                        <tr>
                           <td align="center">
                              <div class="cardtitle">
                                 Filtering
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">
                              <div class="cardsubtitle">
                                 Filter By:
                              </div>
                           </td>
                        </tr><tr>
                           <td align="center">       
                              <select onChange={this.selectFilterVariable}>
                                 <option value="" selected>---------- select a variable ----------</option>
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
                           </td>
                        </tr><tr>
                           <td align="center">  
                              {this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                                 <div>
                                    <div class="cardsubtitle">
                                       Start Date:
                                    </div>                   
                                    <input type="date" min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue} />
                                    <br /><br />

                                    <div class="cardsubtitle">
                                       End Date:
                                    </div>
                                    <input type="date" min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue2} />
                                    <br /><br />
                                 </div>
                              }
                              {this.state.selectedfiltervariable && !this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                                 <div>
                                    <div class="cardsubtitle">
                                       {this.state.selectedfiltervariable.substring(3,)}:
                                    </div>
                                    <select required onChange={this.selectFilterValue}>
                                       <option value="" disabled selected>---------- select a variable ----------</option>
                                       {this.state.filtervaluelistoptions}                         
                                    </select>
                                    <br /><br />
                                 </div>
                              }  
                           </td>
                           <br/>
                        </tr><tr>
                           <td align="center">                                                            
                              <button id="submitbutton" class="button" type="submit" style={{"vertical-align":"middle"}}>Generate Scatterplot</button>
                           </td>
                        </tr>
                     </table>
                     <br/>          
                  </form>                   
                  </td>
                  <td></td>
                  <td align="center" style={{"width":"80%", "box-shadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "border-radius":"12px", "padding":"10px"}} bgcolor="white">
                     <label id="message" style={{"vertical-align":"center"}}>Plot Display Area</label>                  
                     {this.state.scatterplot}   
                  </td>
               </tr>
            </table>  
            </div>                                 
         </div>
      );
   }
}
export default Chartbi;