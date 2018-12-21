import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

var $ = require('jquery');

class TableView extends Component {  
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
      $.getJSON(window.location.origin + "/mysqltables/", (data) => {
         var mySQLTables = "";
         $.each(data, function(key, val) {
            mySQLTables = val;
         });

         if (mySQLTables.toString().replace(/\s/g, '').length) { //checking data is not empty 
            this.createOptions(mySQLTables);                     
         }                  
      });
   }    

   //creating select options for drop down list based on data from flask
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

   //retrieving table display from flask
   display(event) {
      $.post(window.location.origin + "/tableview/",
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
         <div style={{"overflow":"auto", "max-height":"500px"}}>
            <select onChange={this.display}>
               <option value="" disabled selected>Select a Table to View</option>
               {this.state.options}
            </select>
            <table border="1">
               {ReactHtmlParser(this.state.table)}
            </table>
         </div>
      );
   }
}
export default TableView;