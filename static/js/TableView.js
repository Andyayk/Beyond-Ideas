import React, { Component } from "react";
import ReactDOM from "react-dom";

var $ = require('jquery');

class TableView extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",         
         returnedData: "",
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.display = this.display.bind(this);

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

   display(event) {
      $.post(window.location.origin + "/tableview/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            returnedData: data
         });         
      });        
   }

   render() {
      return (
         <div>
            <select onChange={this.display}>
               <option value="" disabled selected>Select a Table to View</option>
               {this.state.options}
            </select>
            <table border="1">
               {this.state.returnedData}
            </table>
         </div>
      );
   }
}
export default TableView;