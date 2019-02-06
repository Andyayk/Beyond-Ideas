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
         colnames: [],
         colvalues: [],
         colnames2: [],
         colvalues2: [],   
         combinedcolnames: [],
         combinedcolvalues: [],
         exporttable1: "",
         exporttable2: "",
         selectedjoinvariable: "activitydate", 
         tables2: ""
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.getMySQLTables2 = this.getMySQLTables2.bind(this);      

      this.display = this.display.bind(this);
      this.display2 = this.display2.bind(this);  

      this.save = this.save.bind(this);   
   
	   this.selectJoinVariable = this.selectJoinVariable.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

      this.getMySQLTables(); //retrieving user's uploaded tables
      this.getMySQLTables2();
<<<<<<< HEAD
=======

	  this.checkradiobutton = this.checkradiobutton.bind(this);
>>>>>>> parent of 544b2b2... Add dynamic radio button for table 1
     
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

   getMySQLTables2() {
      $.getJSON(window.location.origin + "/get_all_dataset_api", (data) => {
         var mySQLTables = data['datasetNames'][0]['name'];

         this.setState({
            tables2: mySQLTables
         });
      });
   }      

<<<<<<< HEAD
=======
	checkradiobutton(datavariable1, datavariable2, radiobutton, labelnames){
      if (datavariable1.toString().replace(/\s/g, '').length && datavariable2.toString().replace(/\s/g, '').length){
         this.setState({
            selectedjoinvariable: ""
         });  
         document.getElementById(radiobutton).disabled = false; 
         document.getElementById(labelnames).style = "color:black";
      } else {
         this.setState({
            selectedjoinvariable: ""
         });  
         document.getElementById(radiobutton).disabled = true;
         document.getElementById(labelnames).style = "color:#a3a3a3";         
      }
   }

>>>>>>> parent of 544b2b2... Add dynamic radio button for table 1
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
      var x = document.getElementById("message");
         x.style.display = "none";

      this.setState({
         exporttable1: event.target.value,
      });
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },

      (data) => {
         this.setState({
            colnames: (data['colnames']),
            colvalues: (data['coldata']),
<<<<<<< HEAD
         });     
      }); 
   }
   
   //retrieving table display from flask
   display2(event) {
      var x = document.getElementById("message");
         x.style.display = "none";
         
      this.setState({
         exporttable2: event.target.value,
      });
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            colnames2: (data['colnames']),
            colvalues2: (data['coldata']),
         });            
      });         
   }   
=======
         });   
         this.getVariables(this.state.exporttable1);
		 
      }); 
   }

   getVariables(table){
      $.post(window.location.origin + "/variablesbi/",
      {
         tablename: table,
      },
      (data) => {
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var geographicallocationvaluelistdata = data['geographicallocationvaluelist'];   
         //creating select options for drop down list based on date data variables from flask
         let datevariablesoptions2 = this.createVariablesOptions(1, datevariablelistdata);  
         //creating select options for drop down list based on company data variables from flask
         let companyvariablesoptions2 = this.createVariablesOptions(1, companyvariablelistdata);
         //creating select options for drop down list based on depot data variables from flask
         let depotvariablesoptions2 = this.createVariablesOptions(1, depotvariablelistdata);
         //creating select options for drop down list based on geographical location data values from flask
         let geographicallocationvariablesoptions2 = this.createVariablesOptions(1, geographicallocationvaluelistdata);      

         this.checkradiobutton(datevariablelistdata, datevariablesoptions2, "dateradio", "labeldate")
         this.checkradiobutton(companyvariablelistdata, companyvariablesoptions2, "companyradio", "labelcompany");
         this.checkradiobutton(depotvariablelistdata, depotvariablesoptions2, "depotradio", "labeldepot");
         this.checkradiobutton(geographicallocationvaluelistdata, geographicallocationvariablesoptions2, "locationradio","labelcountry"); 
      });
   }

   //general method for creating select options for drop down list based on data from flask
   createVariablesOptions(methodNo, variablelistdata) {
      let variables = [];
      if (variablelistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = variablelistdata.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={"t"+methodNo+"."+variablelist[i]}>{methodNo+": "+variablelist[i]}</option>);
         };
      }      
      return variables;
   }
>>>>>>> parent of 544b2b2... Add dynamic radio button for table 1
   
   //retrieving table display from flask
   display2(event) {
      var x = document.getElementById("message");
         x.style.display = "none";
         
      this.setState({
         exporttable2: event.target.value,
      });
      $.post(window.location.origin + "/tableviewbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         this.setState({
            colnames2: (data['colnames']),
            colvalues2: (data['coldata']),
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
   			    combinedcolnames: (data['colnames']),
                combinedcolvalues: (data['coldata']),
   			})
         }              
      });        
   }

   //submit form button
   formSubmitted(event){
      event.preventDefault();
      this.save();
   }

   //rendering the html for table view
   render() {
      return (
      <div>
      Test: {this.state.tables2}
         <form method="POST" onSubmit={this.formSubmitted}>        
         <table align="center" style={{"width":"100%"}}>          
            <tr>                        
               <td style={{"width":"50%"}}>                             
                  <div class="cardview">
                     <div class="containerview">                      
                        <table align="center">
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
                                <select required onChange={this.display}>
                                  <option value="" disabled selected>--------------- select a dataset ---------------</option>
                                  {this.state.options} 
                                </select>                     
                              </td>
                              <td align="center">
                                <select required onChange={this.display2}>
                                  <option value="" disabled selected>--------------- select a dataset ---------------</option>
                                  {this.state.options}
                                </select>                  
                              </td>    
                           </tr>
                        </table>                        
                     </div>
                  </div>   
               </td>
               <td style={{"width":"50%"}}>
                  <div class="cardcombine">
                     <div class="containercombine">                 
                        <table align="center">
                           <tr>
                              <td colspan="2" align="center">
                                 <div class="cardtitle">
                                    Combine Selected Datasets
                                 </div>
                              </td>
                           </tr><tr></tr><tr></tr><tr></tr><tr>
                              <td colspan="2" align="center">
                                 <div class="cardsubtitle">
                                    <div class="tooltip">
                                       Select variable to combine both datasets:<span class="tooltiptext">Tip for user (?)</span>
                                    </div>
                                 </div>
                              </td>
                           </tr><tr>
                              <td colspan="2" align="center">
                                 <table>
                                    <tr>
                                       <td>
                                          <input type="radio" name="joinvariable" value="activitydate" required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/>Activity Date
                                       </td><td>
                                          <input type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/>Company
                                       </td>
                                    </tr><tr>
                                       <td>
                                          <input type="radio" name="joinvariable" value="geographicallocation" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"}/>Country Name                                           
                                       </td><td>  
                                          <input type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/>Depot
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr><tr>
                              <td colspan="2" align="center">
                                 <button class="button" type="submit" style={{"vertical-align":"middle"}}><span>Combine Datasets & Save</span></button>
                              </td>
                           </tr>
                        </table> 
                     </div>                     
                  </div>                 
               </td>              
            </tr>           
            <tr>
            </tr>
            <tr>
            <td id="testing" colspan="2" align="center" style={{"height":"400px", "box-shadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "border-radius":"12px", "padding":"10px"}} valign="top" align="center" bgcolor="white">   
               <table id="message" vertical-align="center" style={{"padding":"150px"}}>
                  <tr>
                     <label>Dataset Display Area</label>
                  </tr>
               </table>
               <table>
         			<tr>
         				<td align="center" style={{"overflow":"auto", "max-width":"1155px", "position":"relative", "vertical-align":"top"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable" style={{"width":"1150px","max-width":"1150px"}}>
                              {this.state.combinedcolnames.map((combinedcolname) => <th>{combinedcolname}</th>)}
							        {this.state.combinedcolvalues.map((combinedrows)=> <tr> {combinedrows.map((combinedrow) => <td><center>{combinedrow}</center></td>)}</tr>)}
         				      </table>
                        </div>
         				</td>
         			</tr>
               </table>
               <table>
                  <tr>
                     <td style={{"overflow":"auto", "max-width":"555px", "position":"relative", "vertical-align":"top"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable" style={{"width":"550px","max-width":"550px"}}>       
                              {this.state.colnames.map((colname) => <th>{colname}</th>)}
							  {this.state.colvalues.map((rows)=> <tr> {rows.map((row) => <td><center>{row}</center></td>)}</tr>)}
                           </table>
                        </div>
                     </td><td></td><td></td><td></td><td></td><td></td>
                     <td style={{"overflow":"auto", "max-width":"555px", "position":"relative", "vertical-align":"top"}}>
                        <div style={{"overflow-x":"auto"}}>
                           <table class="outputtable" style={{"width":"550px","max-width":"550px"}}>   
                              {this.state.colnames2.map((colname2) => <th>{colname2}</th>)}
							  {this.state.colvalues2.map((rows2)=> <tr> {rows2.map((row2) => <td><center>{row2}</center></td>)}</tr>)}
                           </table>
                        </div>
                     </td>
                  </tr>
               </table>
            </td>
            </tr>
         </table>
         </form>           
      </div>
      );
   }
}
export default TableViewbi;