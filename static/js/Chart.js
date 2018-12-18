import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Plot from 'react-plotly.js';

var $ = require('jquery');

class Chart extends Component {  
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

      this.getMySQLTables();
   }

   getMySQLTables() {
      $.getJSON(window.location.origin + "/mysqltables/", (data) => {
         var mySQLTables = "";
         $.each(data, function(key, val) {
            mySQLTables = val;
         });

         this.createOptions(mySQLTables);                     
      });
   }    

   createOptions(data) {
      let options = [];
      var mySQLTables = data.toString().split(",");
      for (let i = 0; i < mySQLTables.length; i++) {
         options.push(<option value={mySQLTables[i]}>{mySQLTables[i]}</option>);
      };

      this.setState({
         options: options
      });
   }   

   getVariables(event) {
      this.setState({
         selectedtable: event.target.value
      });

      $.post(window.location.origin + "/variables/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var variablelist = "";
         $.each(data, function(key, val) {
            variablelist = val;
         });         
         this.createVariables(variablelist);          
      });     
   }

   getVariables2(event) {
      this.setState({
         selectedtable2: event.target.value
      });

      $.post(window.location.origin + "/variables/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var variablelist = "";
         $.each(data, function(key, val) {
            variablelist = val;
         });         
         this.createVariables2(variablelist);        
      });   
   }       

   createVariables(data) {
      let variables = [];
      var variablelist = data.toString().split(",");
      for (let i = 0; i < variablelist.length; i++) {
         variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
      };

      this.setState({
         variablesoptions: variables
      });
   }    

   createVariables2(data) {
      let variables = [];
      var variablelist = data.toString().split(",");
      for (let i = 0; i < variablelist.length; i++) {
         variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
      };

      this.setState({
         variablesoptions2: variables
      });
   }     

   selectVariable(event) {
      this.setState({
         selectedvariable: event.target.value
      });      
   }

   selectVariable2(event) {
      this.setState({
         selectedvariable2: event.target.value
      });      
   }   

   joinVariable(event) {
      this.setState({
         joinvariable: event.target.value
      });      
   }

   joinVariable2(event) {
      this.setState({
         joinvariable2: event.target.value
      });      
   } 

   generateScatterplot(event) {
      $.post(window.location.origin + "/scatterplotdata/",
      {
         selectedtable: this.state.selectedtable,
         selectedtable2: this.state.selectedtable2,            
         selectedvariable: this.state.selectedvariable,
         selectedvariable2: this.state.selectedvariable2,    
         joinvariable: this.state.joinvariable,
         joinvariable2: this.state.joinvariable2,  
      },
      (data) => {
         var xarray = "";
         var yarray = "";
         $.each(data, function(key, val) {
            if(xarray == "") {
               xarray = val;
            } else {
               yarray = val;
            }
         });   

         this.setState({
            scatterplot: <Plot data={[{
                           x: xarray.toString().split(",").map(Number),
                           y: yarray.toString().split(",").map(Number),
                           type: 'scatter',
                           mode: 'markers',
                           marker: {color: 'red'}
                           }]}
                           layout={{
                              width: 1000, 
                              height: 900, 
                              title: 'Correlation between ' + this.state.selectedvariable + ' and ' + this.state.selectedvariable2,
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
                              },
                              showlegend: false,                           
                           }}
                        />   
         });       
      });    
   }         

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
                     <br /><br />                     
                     <button onClick={this.generateScatterplot}>Generate Scatterplot</button>
                     <br /><br /><br />                
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
export default Chart;