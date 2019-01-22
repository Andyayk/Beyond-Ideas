import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

import "../css/main";

var $ = require('jquery');

class TableViewbi extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",         
         table: "",
         table2: "",
		   combinedtable: "",
         exporttable1: "",
         exporttable2: "",
         selectedjoinvariable: "activitydate", 
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.display = this.display.bind(this);
      this.display2 = this.display2.bind(this);  

      this.save = this.save.bind(this);   
   
	   this.selectJoinVariable = this.selectJoinVariable.bind(this); 

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
   
   //store the variable that the user has selected
   selectJoinVariable(event) {
      this.setState({
         selectedjoinvariable: event.target.value
      });      
   }  
   
   //retrieving csv export from flask
   save(event) {
      console.log(this.state.exporttable1);
      $.post(window.location.origin + "/savejoinedtablebi/",
      {
         tablename1: this.state.exporttable1,
         tablename2: this.state.exporttable2,
         selectedjoinvariable: this.state.selectedjoinvariable,
      },
      (data) => {  
         if(data == "Something is wrong with writeToCSV method") {
            this.setState({
               error: "Please Select a Table",
            });
         } else {
            console.log(data);
   			this.setState({
   			    combinedtable: data,
   			})
         }              
      });        
   }

   //rendering the html for table view
   render() {
      return (
      <div>
         <table style={{"width":"100%"}}> 
            <tr>              
               <td>
                  <table style={{"width":"100%"}}>
                     <div class="card">
                        <div class="container">
                           <th colspan="2">View Datasets</th>
                           <tr>
                              <td style={{"width":"50%", "left":"0px", "position":"relative"}}>
                                <select onChange={this.display}>
                                  <option value="" disabled selected>Select a dataset to view</option>
                                  {this.state.options}
                                </select>                     
                              </td>
                              <td style={{"width":"50%", "right":"0px", "position":"relative"}}>
                                <select onChange={this.display2}>
                                  <option value="" disabled selected>Select another dataset to view</option>
                                  {this.state.options}
                                </select>                  
                              </td>    
                           </tr><tr>

                           </tr>
                        </div>
                     </div>
                  </table>
               </td><td>
                  <div class="card">
                     <div class="container">
                           <form>
                              <table style={{"width":"100%"}}>
                                 <tr>
                                    <td colspan="2" align="center">
                                       <b>Combine Datasets</b>
                                    </td>
                                 </tr><tr>
                                    <label for="joinvariable"><i>Select variable to combine both datasets:</i></label>
                                 </tr><tr>
                                    <td>
                                       <input type="radio" name="joinvariable" value="activitydate" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/>Activity Date
                                    </td><td>
                                       <input type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/>Depot
                                    </td>
                                 </tr><tr>
                                    <td>
                                       <input type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/>Company
                                    </td><td>                                    
                                       <input type="radio" name="joinvariable" value="geographicallocation" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"}/>Geographical Location
                                    </td>
                                 </tr><tr></tr><tr></tr><tr>
                                    <td colspan="2" align="center">
                                       
                                    </td>
                                 </tr>
                              </table>
                           </form>   
						   <button class="button" style={{"vertical-align":"middle"}} onClick={this.save}><span>Save to Database</span></button>
                     </div>                     
                  </div>
               </td>
            </tr>
         </table>

			
         <table>
			<tr>
				<td style={{"overflow":"auto", "max-height":"500px", "left":"0px", "position":"relative", "vertical-align":"top"}}>
					<table border="1">
						{ReactHtmlParser(this.state.combinedtable)}
					</table>
				</td>
			</tr>
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
         <tr>
            <td>
                 
            </td>
            <td>
                  
            </td>
         </tr>
      </div>
      );
   }
}
export default TableViewbi;