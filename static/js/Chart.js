import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

var $ = require('jquery');

class Chart extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",            
         variables: "", 
         variables2: "",                       
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);    
      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);        
      this.createVariables = this.createVariables.bind(this);   
      this.createVariables2 = this.createVariables2.bind(this);          

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

   getVariables2() {
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
         variables: variables
      });
   }    

   createVariables2(data) {
      let variables = [];
      var variablelist = data.toString().split(",");
      for (let i = 0; i < variablelist.length; i++) {
         variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
      };

      this.setState({
         variables2: variables
      });
   }      

   render() {
      return (
         <div>
            <table>
               <tr>
                  <td valign="top" align="center" bgcolor="white">      
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
                     <select name="variablelist">
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variables}
                     </select>
                     <br /><br />
                     <label for="variablelist2">Variable (Y):</label>        
                     <br />
                     <select name="variablelist2">
                        <option value="" disabled selected>Select a Variable</option>
                        {this.state.variables2}
                     </select>     
                     <br /><br />
                     <button type="submit">Generate Scatterplot</button>
                     <br /><br /><br />                
                  </td>
                  <td></td>
                  <td align="center" bgcolor="white">
                     <h3>Select Datasources</h3>
                     <p>Click "Get Variables" to load Variables</p>             
                  </td>
               </tr>
            </table>                      
         </div>
      );
   }
}
export default Chart;