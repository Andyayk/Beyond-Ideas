import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

import "../main";

var $ = require('jquery');

class TableViewbi extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",         
         table: "",
         table2: "",
		   exporttable1: "",
		   tablename: "",
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.display = this.display.bind(this);
      this.display2 = this.display2.bind(this);    
      this.save = this.save.bind(this);     

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
     this.setState({
       exporttable1: event.target.value,
     });
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            table: data,
         });         
      }); 
   }
	
   //retrieving table display from flask
   display2(event) {
      this.setState({
         exporttable2: event.target.value,
      });
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            table2: data,
         });         
      });        
   }     
   
   //retrieving csv export from flask
   save(event) {
      console.log(this.state.exporttable1);
      $.post(window.location.origin + "/savejoinedtablebi/",
      {
         tablename1: this.state.exporttable1,
         tablename2: this.state.exporttable2,
      },
      (data) => {  
         if(data == "Something is wrong with writeToCSV method") {
            this.setState({
               error: "Please Select a Table",
            });
         } else {
            console.log(data);
         }              
      });        
   }

   //rendering the html for table view
   render() {
      return (
		<div>
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

			<table>
				<tr>
					<td style={{"width":"50%", "left":"0px", "position":"relative"}}>
						<h3>First Table</h3>
					  
					  <select onChange={this.display}>
						 <option value="" disabled selected>Select a Table to View</option>
						 {this.state.options}
					  </select>                     
					</td>
					<td style={{"width":"50%", "right":"0px", "position":"relative"}}>
						<h3>Second Table</h3>

					  <select onChange={this.display2}>
						 <option value="" disabled selected>Select a Table to View</option>
						 {this.state.options}
					  </select>                  
					</td>
				</tr>
				<button class="button" style={{"vertical-align":"middle"}} onClick={this.save}><span>Save Joined Files</span></button>
				<tr>
					<td style={{"overflow":"auto", "max-height":"500px", "left":"0px", "position":"relative", "vertical-align":"top"}}>
						<table border="1">
						   {ReactHtmlParser(this.state.table)}
						</table>
					</td>
					<td style={{"overflow":"auto", "max-height":"500px", "right":"0px", "position":"relative", "vertical-align":"top"}}>
						<table border="1">
						   {ReactHtmlParser(this.state.table2)}
						</table>
					</td>
				</tr>
			</table>
		</div>
      );
   }
}
export default TableViewbi;