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

      this.getMySQLTables(); //retrieving user's uploaded tables
	  console.log("hihi"+this.state.exporttable1);
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
	  let tablename = event.target.value;
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            table: data,
         });         
      });  
      
	  console.log("test"+this.state.exporttable1);
   }

	handleChange(event) {
		this.setState({
			exporttable1: event.target.value,
		});
    }
	
   //retrieving table display from flask
   display2(event) {
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
      $.post(window.location.origin + "/exporttableviewbi/",
      {
         tablename: this.state.exporttable1,
      },
      (data) => {  
         if(data == "Something is wrong with writeToCSV method") {
            this.setState({
               error: "Please Select a Table",
            });
         } else {
            var element = document.createElement('a');
            var newContent = data.replace(/;/g, "\n");
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
            element.setAttribute('download', this.state.exporttable1 + ".csv");
             
            element.style.display = 'none';
            document.body.appendChild(element);
             
            element.click();
            document.body.removeChild(element); 
         }              
      });        
   }
   //rendering the html for table view
   render() {
      return (
		<div>
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
					<td style={{"overflow":"auto", "max-height":"500px", "left":"0px", "position":"relative"}}>
						<table border="1">
						   {ReactHtmlParser(this.state.table)}
						</table>
					</td>
					<td style={{"overflow":"auto", "max-height":"500px", "right":"0px", "position":"relative"}}>
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