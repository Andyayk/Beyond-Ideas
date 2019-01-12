import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

var $ = require('jquery');

class TableViewbi extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",         
         table: "",
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.display = this.display.bind(this);

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

   //retrieving table display from flask
   display(event) {
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            table: data
         });         
      });        
   }

   //rendering the html for table view
   render() {
      return (
		<table>
			<tr>
				<td style="width:50%; left:0; position:relative;">
					<h3>First Table</h3>
				</td>
				<td style="width:50%; right:0; position:relative;">
					<h3>Second Table</h3>
				</td>
			</tr>
			<tr>
				<td style={{"overflow":"auto", "max-height":"500px", "left":"0px", "position":"relative"}}>
					<select onChange={this.display}>
					   <option value="" disabled selected>Select a Table to View</option>
					   {this.state.options}
					</select>
					<table border="1">
					   {ReactHtmlParser(this.state.table)}
					</table>
				</td>
				<td style={{"overflow":"auto", "max-height":"500px", "right":"0px", "position":"relative"}}>
					<select onChange={this.display}>
					   <option value="" disabled selected>Select a Table to View</option>
					   {this.state.options}
					</select>
					<table border="1">
					   {ReactHtmlParser(this.state.table)}
					</table>
				</td>
			 </tr>
		 </table>
      );
   }
}
export default TableViewbi;