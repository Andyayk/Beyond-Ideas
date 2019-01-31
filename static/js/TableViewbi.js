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
         selectedjoinvariable: "", 
         tables2: ""
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);
      this.getMySQLTables2 = this.getMySQLTables2.bind(this);      
      this.checkradiobutton = this.checkradiobutton.bind(this);
      this.checksubmitbutton = this.checksubmitbutton.bind(this);
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);
      this.display = this.display.bind(this);
      this.display2 = this.display2.bind(this);  

      this.save = this.save.bind(this);   
   
	   this.selectJoinVariable = this.selectJoinVariable.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

      this.getMySQLTables(); //retrieving user's uploaded tables
      this.getMySQLTables2();
     
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
    checkradiobutton(datavariable1, datavariable2, radiobutton, labelnames, keyword){
      var match1 = false;
      var match2 = false;
      var i;
      // console.log(keyword);
      for (i=0; i < datavariable1.length; i++){
          
          if(datavariable1[i].toLowerCase().includes(keyword)){
            console.log(datavariable1[i].toLowerCase())
              match1 = true;
              break;
          }
      }
      for (i=0; i < datavariable2.length; i++){
          if(datavariable2[i].toLowerCase().includes(keyword)){
            console.log(datavariable2[i].toLowerCase())
              match2 = true;
              break;
          }
      }
      
      if (match1 && match2){
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
   
   checksubmitbutton(radiobutton1, radiobutton2, radiobutton3, radiobutton4, table){
      if (document.getElementById(radiobutton1).disabled && document.getElementById(radiobutton2).disabled && document.getElementById(radiobutton3).disabled && document.getElementById(radiobutton4).disabled && table != []){
         this.enablesubmitbutton(false);

         this.setState({
            errorstatement: "Datasets doesn't contain matching columns describing the following options"
         });
      } else{
         this.enablesubmitbutton(true);

         this.setState({
            errorstatement: ""
         });
      }
   }
   
   enablesubmitbutton(enable){
       if(enable){
            var element = document.getElementById('submitbutton');
            element.disabled = false;
            element.style.background = "#4CAF50";
            element.style.opacity = "1";            
            element.style.cursor = "pointer";
       } else {
            var element = document.getElementById('submitbutton');
            element.disabled = true;
            element.style.background = "red";
            element.style.opacity = "0.6";
            element.style.cursor = "not-allowed";
       }
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
         this.checkradiobutton(data['colnames'], this.state.colnames2, "dateradio", "labeldate", "date")
         this.checkradiobutton(data['colnames'], this.state.colnames2, "companyradio", "labelcompany", "company");
         this.checkradiobutton(data['colnames'], this.state.colnames2, "depotradio", "labeldepot", "depot");
         this.checkradiobutton(data['colnames'], this.state.colnames2, "locationradio","labelcountry", "location");
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.colnames2);   
         
         this.setState({
            colnames: (data['colnames']),
            colvalues: (data['coldata']),
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
          
         this.checkradiobutton(data['colnames'], this.state.colnames, "dateradio", "labeldate", "date")
         this.checkradiobutton(data['colnames'], this.state.colnames, "companyradio", "labelcompany", "company");
         this.checkradiobutton(data['colnames'], this.state.colnames, "depotradio", "labeldepot", "depot");
         this.checkradiobutton(data['colnames'], this.state.colnames, "locationradio","labelcountry", "location");
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.colnames);   
          
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
                                          <input id="dateradio" type="radio" name="joinvariable" value="activitydate" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/><label id="labeldate">Activity Date</label>
                                       </td><td>
                                          <input id="companyradio" type="radio" name="joinvariable" value="company" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/><label id="labelcompany">Company</label>
                                       </td>
                                    </tr><tr>
                                       <td>
                                          <input id="locationradio" type="radio" name="joinvariable" value="geographicallocation" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "geographicallocation"}/><label id="labelcountry">Country Name</label>                                           
                                       </td><td>  
                                          <input id="depotradio" type="radio" name="joinvariable" value="depot" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/><label id="labeldepot">Depot</label>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr><tr>
                              <td colspan="2" align="center">
                                 <button id="submitbutton" class="button" type="submit" style={{"vertical-align":"middle"}}><span>Combine Datasets & Save</span></button>
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