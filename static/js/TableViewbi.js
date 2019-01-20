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
                  <div class="cardview">
                     <div class="containerview">
                        <table style={{"width":"100%"}}>
                           <tr>
                              <th colspan="2" align="center">
                                 <div class="cardtitle">Select Dataset(s) to View</div>
                              </th>
                           </tr><tr></tr><tr></tr><tr></tr><tr></tr><tr>
                              <td align="center">
                                 <div class="cardsubtitle">Dataset One:</div>
                              </td>
                              <td align="center">
                                 <div class="cardsubtitle">Dataset Two:</div>
                              </td>                              
                           </tr><tr>
                              <td align="center">
                                <select onChange={this.display}>
                                  <option value="" disabled selected>--------------- select your dataset ---------------</option>
                                  {this.state.options}
                                </select>                    
                              </td>
                              <td align="center">
                                <select onChange={this.display2}>
                                  <option value="" disabled selected>--------------- select your dataset ---------------</option>
                                  {this.state.options}
                                </select>     
                              </td>    
                           </tr>
                        </table>
                     </div>
                  </div>
               </td><td>
                  <div class="cardcombine">
                     <div class="containercombine">
                           <form>
                              <table style={{"width":"100%"}}>
                                 <tr>
                                    <td colspan="2" align="center">
                                       <div class="cardtitle">
                                             Combine Selected Datasets  
                                       </div>
                                    </td>
                                 </tr><tr></tr><tr></tr><tr></tr><tr>
                                    <td colspan="2" align="center">
                                       <label for="joinvariable">
                                          <div class="cardsubtitle">
                                             <div class="tooltip">
                                                Select 1 Variable to Combine the Datasets:<span class="tooltiptext">Tip for user (?)</span>
                                             </div>
                                          </div>
                                       </label>
                                    </td>
                                 </tr><tr>
                                    <td colspan="2" align="center">                                 
                                       <table>
                                          <tr>
                                             <td>
                                                <input type="radio" name="joinvariable" value="activitydate" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/>Activity Date
                                             </td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>
                                                <input type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/>Depot
                                             </td>
                                          </tr><tr>
                                             <td>
                                                <input type="radio" name="joinvariable" value="geographicallocation" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"}/>Geographical Location
                                             </td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>
                                                <input type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/>Company
                                             </td>
                                          </tr><tr></tr><tr></tr><tr>
                                             <td colspan="11" align="center">
                                                <button class="button" style={{"vertical-align":"middle"}} onClick={this.save}><span>Combine & Save as New Dataset</span></button>
                                             </td>
                                          </tr>
                                       </table>
                                    </td>
                                 </tr>
                              </table>
                           </form>   
                     </div>                     
                  </div>
               </td>
            </tr>
         </table>

         <table style={{"padding":"3px"}}>
            <div class="cardtable">
               <div class="containertable">     
            		<tr>
               		<td style={{"overflow":"auto", "max-height":"500px", "max-width":"1160px", "position":"relative", "vertical-align":"top"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable">
            						{ReactHtmlParser(this.state.combinedtable)}
            					</table>
                        </div>
         				</td>
               	</tr><tr>
                     <td style={{"overflow":"auto", "max-height":"500px","max-width":"580px", "position":"relative", "vertical-align":"top", "align":"left"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable">
                              {ReactHtmlParser(this.state.table)}
                           </table>
                        </div>
                     </td>
                     <td style={{"overflow":"auto", "max-height":"500px","max-width":"580px", "position":"relative", "vertical-align":"top", "align":"right"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable">
                              {ReactHtmlParser(this.state.table2)}
                           </table>
                        </div>
                    </td>
                  </tr>
               </div>
            </div>
         </table>
      </div>
         
      );
   }
}
export default TableViewbi;