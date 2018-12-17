import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

var $ = require('jquery');

class ExportTables extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",   
         selected: "",
         error: "",      
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.select = this.select.bind(this);      
      this.save = this.save.bind(this);

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

   select(event) {
      this.setState({
         selected: event.target.value,
      });
   }

   save(event) {
      $.post(window.location.origin + "/export/",
      {
         tablename: this.state.selected,
      },
      (data) => {  
         if(data == "Something is wrong with writeToCSV method") {
            this.setState({
               error: "Please Select a Table",
            });
         } else {
            var element = document.createElement('a');
            var newContent = data.replace(/;/g, "\n")
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
            element.setAttribute('download', this.state.selected + ".csv");
             
            element.style.display = 'none';
            document.body.appendChild(element);
             
            element.click();
            document.body.removeChild(element); 
         }              
      });        
   }

   render() {
      return (
         <div>
            <select onChange={this.select}>
               <option value="" disabled selected>Select a Table to Export</option>
               {this.state.options}
            </select>
            <button onClick={this.save}>Save File</button>
            <br />
            <font color="red">{this.state.error}</font>
         </div>
      );
   }
}
export default ExportTables;