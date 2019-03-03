import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MUIDataTable from 'mui-datatables';

import "../css/TableViewbi";
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
         table1boolean: false,
         table2boolean: false,
         combinedtableboolean: false,
         hideLoadingBarOne: true,
         hideLoadingBarTwo: true,
         radioButtonCount: "",
         hideLoadingBarThree: true
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);   
      this.checkradiobutton = this.checkradiobutton.bind(this);
      this.checksubmitbutton = this.checksubmitbutton.bind(this);
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);
      this.display = this.display.bind(this);
      this.display2 = this.display2.bind(this);  

      this.save = this.save.bind(this);   
   
	   this.selectJoinVariable = this.selectJoinVariable.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

      this.callBackendAPI = this.callBackendAPI.bind(this);

      this.getMySQLTables(); //retrieving user's uploaded tables

      this.loadingBarInstanceOne = (
         <div className="loader"></div>                                      
      );

      this.loadingBarInstanceTwo = (
         <div className="loader"></div>                                   
      );

      this.loadingBarInstanceThree = (
         <div className="loader"></div>                                   
      );

   }

   //retrieving user's uploaded tables   
   getMySQLTables() {
      var mySQLTables = "";
      this.callBackendAPI("/get_all_dataset_api")
      .then(res => {
         // console.log(res);
         // console.log(res.datasetNames);
         // this.setState({ datasetNames: res.datasets });
         var datasetNames = res.datasetNames;
         var mySQLTables = [];
         datasetNames.map((datasetName, key) =>
            mySQLTables.push(datasetName.name)
         );
         // console.log(mySQLTables);
         this.createOptions(mySQLTables);
      })
   }  

   // GET METHOD CALL
   async callBackendAPI(url) {
      const response = await fetch(url);
      const body = await response.json();
      if (response.status !== 200) {
         throw Error(body.message);
      }
      return body;
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
   
   //changing the radio button status if there's matching combined variables
   checkradiobutton(datavariable1, datavariable2, radiobutton, labelnames, keyword){
      var match1 = false;
      var match2 = false;
      var i;
      // console.log(keyword);
      for (i=0; i < datavariable1.length; i++){
          
         if(datavariable1[i].toLowerCase().includes(keyword)){
         // console.log(datavariable1[i].toLowerCase())
            match1 = true;
            break;
         }
      }
      for (i=0; i < datavariable2.length; i++){
         if(datavariable2[i].toLowerCase().includes(keyword)){
         // console.log(datavariable2[i].toLowerCase())
            match2 = true;
            break;
         }
      }
      
      if (match1 && match2 && (this.state.exporttable1 != this.state.exporttable2)){
         this.setState({
            selectedjoinvariable: ""
         });  
         document.getElementById(radiobutton).disabled = false; 
         document.getElementById(labelnames).style = "color:black";
         var currentCount = this.state.radioButtonCount + 1;
         this.setState({radioButtonCount : currentCount});         
      } else {
         this.setState({
            selectedjoinvariable: ""
         });  
         document.getElementById(radiobutton).disabled = true;
         document.getElementById(labelnames).style = "color:#a3a3a3";         
      }
   }
   
   //changing the submit button status if there's any matching combined variables selected by the user
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
   
   //activating the submit button
   enablesubmitbutton(enable){
      if(enable){
         var element = document.getElementById('submitbutton');
         element.disabled = false;
         element.style.background = "#fecb2f";
         element.style.color = "black";                           
         element.style.opacity = "1";            
         element.style.cursor = "pointer";
      } else {
         var element = document.getElementById('submitbutton');
         element.disabled = true;
         element.style.background = "red";
         element.style.color = "white";         
         element.style.opacity = "0.6";
         element.style.cursor = "not-allowed";
      }
   }

   //retrieving table display from flask
   display(event) {  
      var x = document.getElementById("data1area");
      x.style.display = "none";
      this.setState({radioButtonCount : 0});

      this.setState({
         hideLoadingBarOne: false
      });

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
         this.checkradiobutton(data['colnames'], this.state.colnames2, "locationradio","labelcountry", "country");
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.colnames2);   
         
         if(this.state.radioButtonCount == 1){
              var dateEle = document.getElementById("dateradio");
              var companyEle = document.getElementById("companyradio");
              var depotEle = document.getElementById("depotradio");
              var locationEle = document.getElementById("locationradio");
              if(!dateEle.disabled){
                  this.setState({selectedjoinvariable : "activitydate"});
              } 
              else if(companyEle.disabled == false){
                  this.setState({selectedjoinvariable : "company"});
              } 
              else if(depotEle.disabled == false){
                  this.setState({selectedjoinvariable : "depot"});
              } 
              else if(locationEle.disabled == false){
                  this.setState({selectedjoinvariable : "countryname"});
              }
         }
         
         this.setState({
            colnames: (data['colnames']),
            colvalues: (data['coldata']),
            hideLoadingBarOne: true, //hide loading button
            table1boolean: true,
         });

         // console.log(this.state.colnames);
      });


   }
   
   //retrieving table display from flask
   display2(event) {
      var x = document.getElementById("data2area");
         x.style.display = "none";

      this.setState({
         hideLoadingBarTwo: false
      });
      
      this.setState({radioButtonCount : 0});

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
         this.checkradiobutton(data['colnames'], this.state.colnames, "locationradio","labelcountry", "country");
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.colnames);   
         
         if(this.state.radioButtonCount == 1){
              var dateEle = document.getElementById("dateradio");
              var companyEle = document.getElementById("companyradio");
              var depotEle = document.getElementById("depotradio");
              var locationEle = document.getElementById("locationradio");
              if(!dateEle.disabled){
                  this.setState({selectedjoinvariable : "activitydate"});
              } 
              else if(companyEle.disabled == false){
                  this.setState({selectedjoinvariable : "company"});
              } 
              else if(depotEle.disabled == false){
                  this.setState({selectedjoinvariable : "depot"});
              } 
              else if(locationEle.disabled == false){
                  this.setState({selectedjoinvariable : "countryname"});
              }
         }
         
         this.setState({
            colnames2: (data['colnames']),
            colvalues2: (data['coldata']),
            hideLoadingBarTwo: true, //hide loading button            
            table2boolean: true,
         });       
         // console.log(this.state.colnames2);
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
      // console.log(this.state.exporttable1);
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
            // console.log(data);
   			this.setState({
   			    combinedcolnames: (data['colnames']),
                combinedcolvalues: (data['coldata']),
                hideLoadingBarThree: true,
                combinedtableboolean: true
   			})


         }              
      });        
   }

   //submit form button
   formSubmitted(event){
      event.preventDefault();
      this.save();
      this.setState({
         hideLoadingBarThree: false
      });      
   }

   //rendering the html for table view
   render() {
      const style = this.state.hideLoadingBarOne ? {display: 'none'} : {};
      const style2 = this.state.hideLoadingBarTwo ? {display: 'none'} : {};
      const style3 = this.state.hideLoadingBarThree ? {display: 'none'} : {};

      return (
      <div>
         <form method="POST" onSubmit={this.formSubmitted}>        
         <table align="center" style={{"width":"100%"}}>
         <tbody>                   
            <tr>                       
               <td style={{"width":"50%"}}>                             
                  <div className="cardview">
                     <div className="containerview">                      
                        <table align="center">
                        <tbody>                        
                           <tr>
                              <th colSpan="2" align="center">
                                 <div className="cardtitle">Select Dataset(s) to View</div>
                              </th>
                           </tr><tr></tr><tr></tr><tr></tr><tr></tr><tr>
                              <td align="center">
                                 <div className="cardsubtitle">Dataset One:</div>
                              </td>
                              <td align="center">
                                 <div className="cardsubtitle">Dataset Two:</div>
                              </td>                              
                           </tr><tr>
                              <td align="center">
                                <select required defaultValue="" onChange={this.display} style={{"width":"250px"}}>
                                  <option value="" disabled>--------------- select a dataset ---------------</option>
                                  {this.state.options} 
                                </select>
                              </td>
                              <td align="center">
                                <select required defaultValue="" onChange={this.display2} style={{"width":"250px"}}>
                                  <option value="" disabled>--------------- select a dataset ---------------</option>8
                                  {this.state.options}
                                </select>                  
                              </td>    
                           </tr><tr></tr><tr></tr><tr></tr><tr></tr><tr>
                              <td align="center">
                                 <div className="LoadingBarOne" style={style}>
                                    {this.loadingBarInstanceOne}
                                 </div>
                              </td>
                              <td align="center">
                                 <div className="LoadingBarTwo" style={style2}>
                                    {this.loadingBarInstanceTwo}
                                 </div>
                              </td>                              
                           </tr>
                        </tbody> 
                        </table>                        
                     </div>
                  </div>   
               </td>
               <td style={{"width":"50%"}}>
                  <div className="cardcombine">
                     <div className="containercombine">                 
                        <table align="center">
                        <tbody>
                           <tr>
                              <td colSpan="2" align="center">
                                 <div className="cardtitle">
                                    Combine Selected Datasets
                                 </div>
                              </td>
                           </tr><tr></tr><tr></tr><tr></tr><tr>
                              <td colSpan="2" align="center">
                                 <div className="cardsubtitle">
                                    <div className="tooltip">
                                       Select variable to combine both datasets:<span className="tooltiptext">Tip for user (?)</span>
                                    </div>
                                 </div>
                              </td> 
                           </tr><tr>
                              <td colSpan="2" align="center">
                                 <table>
                                 <tbody>
                                    <tr>
                                       <td>
                                          <input id="dateradio" type="radio" name="joinvariable" value="activitydate" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"}/><label id="labeldate">Activity Date</label>
                                       </td><td>
                                          <input id="companyradio" type="radio" name="joinvariable" value="company" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"}/><label id="labelcompany">Company</label>
                                       </td>
                                    </tr><tr>
                                       <td>
                                          <input id="locationradio" type="radio" name="joinvariable" value="countryname" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "countryname"}/><label id="labelcountry">Country Name</label>                                           
                                       </td><td>  
                                          <input id="depotradio" type="radio" name="joinvariable" value="depot" disabled required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"}/><label id="labeldepot">Depot</label>
                                       </td>
                                    </tr>
                                 </tbody>                        
                                 </table>
                              </td>
                           </tr><tr> 
                              <td align="center">
                                 <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}><span>Combine Datasets & Save</span></button>
                              </td><td>   
                                 <div className="LoadingBarThree" style={style3}>
                                    {this.loadingBarInstanceThree}
                                 </div>                              
                              </td>
                           </tr>
                        </tbody>
                        </table> 
                     </div>                     
                  </div>                 
               </td>              
            </tr>           
            <tr>
            </tr>
            <tr>
               <td id="testing" colSpan="2" align="center" style={{"height":"400px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"10px"}} valign="top" align="center" bgcolor="white">   
                  <table>
                     <tbody>
               			<tr>
               				<td align="center" style={{"overflow":"auto", "maxWidth":"1155px", "position":"relative", "verticalAlign":"top"}}>
                              <div style={{"overflowX":"auto"}}>

                                 <div className="outputtable" style={{"width":"1150px","maxWidth":"1150px"}}>
                                    {this.state.combinedtableboolean?(   
                                     <MUIDataTable
                                        title={"Combined Dataset"}
                                        data={this.state.combinedcolvalues}
                                        columns={this.state.combinedcolnames}
                                     />  
                                     ):null
                                    } 
                                 </div> 

                              </div>
               				</td>
               			</tr>
                     </tbody>
                  </table>

                  <table>
                  <tbody>
                     <tr>
                        <td align="center" style={{"overflow":"auto", "maxWidth":"550px", "verticalAlign":"top", "align":"center"}}>
                           <div style={{"overflowX":"auto"}}>
                              <table id="data1area">
                                 <tbody>
                                    <tr>
                                       <td align="center" style={{"width":"550px", "height":"500px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                                             <label style={{"verticalAlign":"center"}}>Dataset One Display Area</label>                                                     
                                       </td>                           
                                    </tr>
                                 </tbody>
                              </table>

                              <div className="outputtable" style={{"width":"550px","maxWidth":"550px"}}>
                                 {this.state.table1boolean?(   
                                  <MUIDataTable
                                     title={"Dataset One: "+this.state.exporttable1}
                                     data={this.state.colvalues}
                                     columns={this.state.colnames}
                                  />  
                                  ):null
                                 } 
                              </div>               

                           </div>
                        </td><td></td><td></td><td></td><td></td><td></td>
                        <td align="center" style={{"overflow":"auto", "maxWidth":"550px", "verticalAlign":"top", "align":"center"}}>
                           <div style={{"overflowX":"auto"}}>
                              <table id="data2area">
                              <tbody>
                                 <tr>
                                    <td align="center" style={{"width":"550px", "height":"500px", "borderRadius":"12px", "padding":"10px"}} bgcolor="#FAFAFA">
                                          <label style={{"verticalAlign":"center"}}>Dataset Two Display Area</label>                  
                                    </td>                           
                                 </tr>
                              </tbody>
                              </table> 

                              <div className="outputtable" style={{"width":"550px","maxWidth":"550px"}}>
                                 {this.state.table2boolean?(  
                                  <MUIDataTable
                                     title={"Dataset Two: "+this.state.exporttable2}
                                     data={this.state.colvalues2}
                                     columns={this.state.colnames2}
                                  />  
                                  ):null
                                 }   
                              </div>   

                           </div>
                        </td>
                     </tr>
                  </tbody>
                  </table>
               </td>
            </tr>
         </tbody>
         </table>
         </form>           
      </div>
      );
   }
}
export default TableViewbi;