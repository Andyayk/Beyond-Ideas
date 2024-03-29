import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';
import SpearmanRHO from 'spearman-rho';

import "../css/main";
import arrowicon from "../images/arrow.png";

var $ = require('jquery');

class Chartbi extends Component {  
   constructor() {
      super();
      this.state = {
         options: "",
         selectedtable: "",
         selectedtable2: "",            
         variablesoptions: "", 
         variablesoptions2: "",
         selectedvariable: "",
         selectedvariable2: "",    
         selectedjoinvariable: "", 
         scatterplot: "",
         selectedfiltervalue: "",
         selectedfiltervalue2: "",    
         datevariablesoptions: "", 
         datevariablesoptions2: "", 
         selectedfiltervariable: "",       
         companyvariablesoptions: "",
         companyvariablesoptions2: "",
         depotvariablesoptions: "",
         depotvariablesoptions2: "",
         countrynamevariablesoptions: "",
         countrynamevariablesoptions2: "",
         companyvaluelistoptions: "",
         companyvaluelistoptions2: "",
         depotvaluelistoptions: "",
         depotvaluelistoptions2: "", 
         countrynamevaluelistoptions: "",
         countrynamevaluelistoptions2: "",
         errorstatement: "",
         errordatestatement: "",
         radioButtonCount: "",
         hideLoadingBar: true,  
         correlationresultexplanation: "",
         currenttime: "",
      };

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);

      this.createVariables = this.createVariables.bind(this);   
      this.createVariablesOptions = this.createVariablesOptions.bind(this);

      this.selectVariable = this.selectVariable.bind(this);   
      this.selectVariable2 = this.selectVariable2.bind(this);  
      this.selectJoinVariable = this.selectJoinVariable.bind(this);     
      this.selectFilterVariable = this.selectFilterVariable.bind(this); 
      this.selectFilterValue = this.selectFilterValue.bind(this);  
      this.selectFilterValue2 = this.selectFilterValue2.bind(this);  
      
      this.checkradiobutton = this.checkradiobutton.bind(this);
      this.checksubmitbutton = this.checksubmitbutton.bind(this);
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);
      this.validateDateRange = this.validateDateRange.bind(this);
      this.resetxvariabledropdown = this.resetxvariabledropdown.bind(this);
      this.resetyvariabledropdown = this.resetyvariabledropdown.bind(this);
      this.resetfiltervariabledropdown = this.resetfiltervariabledropdown.bind(this);  
      this.resetfiltervaluedropdown = this.resetfiltervaluedropdown.bind(this);  
      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

      this.callBackendAPI = this.callBackendAPI.bind(this);

      this.getMySQLTables(); //retrieving user's uploaded tables

      this.loadingBarInstance = (
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
            options.push(<option value={mySQLTables[i].substr(0,mySQLTables[i].lastIndexOf('_'))}>{mySQLTables[i].substr(0,mySQLTables[i].lastIndexOf('_'))}</option>); 
         };
      }

      this.setState({
         options: options
      });
   }        

   checkradiobutton(datavariable1, datavariable2, radiobutton, labelnames){
      if (datavariable1.toString().replace(/\s/g, '').length && datavariable2.toString().replace(/\s/g, '').length && (this.state.selectedtable != this.state.selectedtable2)){
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

   checksubmitbutton(radiobutton1, radiobutton2, radiobutton3, radiobutton4, table){
      if (document.getElementById(radiobutton1).disabled && document.getElementById(radiobutton2).disabled && document.getElementById(radiobutton3).disabled && document.getElementById(radiobutton4).disabled && table != ""){
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

     validateDateRange(fromDate, toDate){
      if(this.state.selectedfiltervariable.toLowerCase().includes("date")){ 
         if(fromDate && toDate && fromDate > toDate){
            this.setState({
               errordatestatement: "Please select a valid date range"
            });
            this.enablesubmitbutton(false);
         } else {
             if(this.state.selectedtable == this.state.selectedtable2){
                 this.setState({errordatestatement: "Please select two different datasets"});
             } else{
                this.setState({errordatestatement: ""});
                this.enablesubmitbutton(true);
             }
         }
      }
    }

    
   resetxvariabledropdown(){
       this.setState({
           selectedvariable : ""
       });
       document.getElementById("xvariabledropdownid").selectedIndex = 0;
   }
   
   resetyvariabledropdown(){
       this.setState({
           selectedvariable2 : ""
       });
       document.getElementById("yvariabledropdownid").selectedIndex = 0;
   }

   resetfiltervariabledropdown(){
      this.setState({
         selectedfiltervariable: "",
         selectedfiltervalue: "",
         errordatestatement: ""
      });
      document.getElementById("filtervariabledropdownid").selectedIndex = -1;
   }

   
   resetfiltervaluedropdown(){
      this.setState({
         selectedfiltervalue : "",
         errordatestatement: ""         
      });
      if(this.state.selectedfiltervariable != "" && !this.state.selectedfiltervariable.toLowerCase().includes("date")){
        document.getElementById("filtervaluedropdownid").selectedIndex = 0; 
      }
      // if(this.state.selectedfiltervariable != ""){
         // var thisElement = document.getElementById("filtervaluedropdownid");
         // thisElement.default = true;
         // thisElement.selectedIndex = "0";
      // }
      
   }

   //retrieving variables from flask
   getVariables(event) {
      this.setState({
         selectedtable: event.target.value
      });
      this.resetfiltervariabledropdown();
      this.resetxvariabledropdown();
      this.setState({radioButtonCount : 0});

      $.post(window.location.origin + "/variablesbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var methodNo = 1;
         var variablelistdata = data['variablelist'];
         var allvariablelistdata = data['allvariablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var countrynamevariablelistdata = data['countrynamevariablelist']; 
         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var countrynamevaluelistdata = data['countrynamevaluelist'];                
         
         this.checkradiobutton(datevariablelistdata, this.state.datevariablesoptions2, "dateradio", "labeldate")
         this.checkradiobutton(companyvariablelistdata, this.state.companyvariablesoptions2, "companyradio", "labelcompany");
         this.checkradiobutton(depotvariablelistdata, this.state.depotvariablesoptions2, "depotradio", "labeldepot");
         this.checkradiobutton(countrynamevaluelistdata, this.state.countrynamevariablesoptions2, "locationradio","labelcountry");
         
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
         
         
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.selectedtable2);         
         
         this.createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, countrynamevariablelistdata, companyvaluelistdata, depotvaluelistdata, countrynamevaluelistdata);                     
      });          
   }

   //retrieving variables from flask
   getVariables2(event) {
      this.setState({
         selectedtable2: event.target.value
      });

      this.resetfiltervariabledropdown();  
      this.resetyvariabledropdown();
      this.setState({radioButtonCount : 0});
      
      $.post(window.location.origin + "/variablesbi/",
      {
         tablename: event.target.value,
      },
      (data) => {
         var methodNo = 2;         
         var variablelistdata = data['variablelist'];
         var allvariablelistdata = data['allvariablelist'];
         var datevariablelistdata = data['datevariablelist'];
         var companyvariablelistdata = data['companyvariablelist'];
         var depotvariablelistdata = data['depotvariablelist'];
         var countrynamevariablelistdata = data['countrynamevariablelist'];         

         var companyvaluelistdata = data['companyvaluelist']; 
         var depotvaluelistdata = data['depotvaluelist'];
         var countrynamevaluelistdata = data['countrynamevaluelist'];  
         
         
         this.checkradiobutton(datevariablelistdata, this.state.datevariablesoptions, "dateradio", "labeldate");
         this.checkradiobutton(companyvariablelistdata, this.state.companyvariablesoptions, "companyradio", "labelcompany");
         this.checkradiobutton(depotvariablelistdata, this.state.depotvariablesoptions, "depotradio", "labeldepot");
         this.checkradiobutton(countrynamevaluelistdata, this.state.countrynamevariablesoptions, "locationradio", "labelcountry");
         
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
         
         this.checksubmitbutton("dateradio", "companyradio", "depotradio", "locationradio", this.state.selectedtable);         

         this.createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, countrynamevariablelistdata, companyvaluelistdata, depotvaluelistdata, countrynamevaluelistdata);                     
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

   //creating select options for drop down list based on data from flask
   createVariables(methodNo, variablelistdata, datevariablelistdata, companyvariablelistdata, depotvariablelistdata, countrynamevariablelistdata, companyvaluelistdata, depotvaluelistdata, countrynamevaluelistdata, allvariablelistdata) {
      let variables = [];
      if (variablelistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
         var variablelist = variablelistdata.toString().split(",");
         for (let i = 0; i < variablelist.length; i++) {
            variables.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
         };
      }

      //creating select options for drop down list based on date data variables from flask
      let datevariables = this.createVariablesOptions(methodNo, datevariablelistdata);

      //creating select options for drop down list based on company data variables from flask
      let companyvariables = this.createVariablesOptions(methodNo, companyvariablelistdata);

      //creating select options for drop down list based on depot data variables from flask
      let depotvariables = this.createVariablesOptions(methodNo, depotvariablelistdata);

      //creating select options for drop down list based on country name data variables from flask
      let countrynamevariables = this.createVariablesOptions(methodNo, countrynamevariablelistdata);

      //creating select options for drop down list based on company data values from flask
      let companyvalues = this.createVariablesOptions(methodNo, companyvaluelistdata);

      //creating select options for drop down list based on depot data values from flask
      let depotvalues = this.createVariablesOptions(methodNo, depotvaluelistdata);

      //creating select options for drop down list based on country name data values from flask
      let countrynamevalues = this.createVariablesOptions(methodNo, countrynamevaluelistdata);      

      if (methodNo == 1) {
         this.setState({
            variablesoptions: variables,
            datevariablesoptions: datevariables,
            companyvariablesoptions: companyvariables,
            depotvariablesoptions: depotvariables,
            countrynamevariablesoptions: countrynamevariables,
            companyvaluelistoptions: companyvalues,
            depotvaluelistoptions: depotvalues,
            countrynamevaluelistoptions: countrynamevalues,
         });        
      } else if (methodNo == 2) {
         this.setState({
            variablesoptions2: variables,
            datevariablesoptions2: datevariables,
            companyvariablesoptions2: companyvariables,
            depotvariablesoptions2: depotvariables,
            countrynamevariablesoptions2: countrynamevariables,
            companyvaluelistoptions2: companyvalues,
            depotvaluelistoptions2: depotvalues,  
            countrynamevaluelistoptions2: countrynamevalues,            
         });           
      }
   }

   //store the variable that the user has selected
   selectVariable(event) {
      this.setState({
         selectedvariable: event.target.value
      });      
   }

   //store the variable that the user has selected
   selectVariable2(event) {
      this.setState({
         selectedvariable2: event.target.value
      });      
   }   

   //store the variable that the user has selected
   selectJoinVariable(event) {
      this.setState({
         selectedjoinvariable: event.target.value
      });      
   }

   //store the filter variable that the user has selected
   selectFilterVariable(event) {
      this.resetfiltervaluedropdown();
      
      this.setState({
         selectedfiltervariable: event.target.value
      });

      $.post(window.location.origin + "/filtervariablebi/",
      {
         selectedfiltervariable: event.target.value,
         tablename: this.state.selectedtable,
         tablename2: this.state.selectedtable2
      },
      (data) => {
         var filtervalueslistdata = data['filtervalueslist']
         let filtervalues = []
         if (filtervalueslistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
            var variablelist = filtervalueslistdata.toString().split(",");
            for (let i = 0; i < variablelist.length; i++) {
               filtervalues.push(<option value={variablelist[i]}>{variablelist[i]}</option>);
            };
         }
         
         this.setState({
             filtervaluelistoptions: filtervalues
         });
                             
      });        
   }    

   //store the filter values that the user has selected
   selectFilterValue(event) {
      if(this.state.selectedfiltervariable.toLowerCase().includes("date")){
            this.validateDateRange(event.target.value, this.state.selectedfiltervalue2);
      }
      this.setState({
         selectedfiltervalue: event.target.value
      });      
   } 

   //store the  filter values 2 (if any) that the user has selected
   selectFilterValue2(event) {    
      if(this.state.selectedfiltervariable.toLowerCase().includes("date")){
         this.validateDateRange(this.state.selectedfiltervalue, event.target.value);
      }
      this.setState({
         selectedfiltervalue2: event.target.value
      });      
   } 

   //retrieving chart data from flask and creating chart using plotly
   generateScatterplot(event) {
      $.post(window.location.origin + "/scatterplotdatabi/",
      {
         selectedtable: this.state.selectedtable,
         selectedtable2: this.state.selectedtable2,            
         selectedvariable: this.state.selectedvariable,
         selectedvariable2: this.state.selectedvariable2,    
         selectedjoinvariable: this.state.selectedjoinvariable,
         selectedfiltervalue: this.state.selectedfiltervalue,
         selectedfiltervalue2: this.state.selectedfiltervalue2,
         selectedfiltervariable: this.state.selectedfiltervariable
      },
      (data) => {
         var plotpointname = "";

         if (this.state.selectedfiltervariable.toLowerCase().includes("date")) {
            plotpointname = "Filter: " + this.state.selectedfiltervalue + " to " + this.state.selectedfiltervalue2;
         } else if (this.state.selectedfiltervariable != "") {
            plotpointname = "Filter: " + this.state.selectedfiltervalue;
         }
            
         var xarray = [];
         var yarray = [];
         $.each(data, function(key, val) {
            if(xarray == "") {
               xarray = val.toString().split(",").map(Number);
            } else {
               yarray = val.toString().split(",").map(Number);
            }
         });   

         var twoDArray = [];

         for (var i = 0; i < xarray.length; i++) { //2D array needed for regression calculation only
            twoDArray.push([xarray[i], yarray[i]]);
         }
         
         var result = regression.linear(twoDArray, {order: 2, precision: 10});
         var gradient = result.equation[0];
         var yIntercept = result.equation[1];
         //var r2 = result.r2.toFixed(2);
         var equation = result.string;
     
         var predictedyarray = xarray.map(function(x) { return gradient * x + yIntercept; }); //calculating the predicted y values, y = mx+c
         var r = Correlation.calc(xarray, yarray).toFixed(2); //rounding r to 2 decimal place
         if(r=='NaN'){
          r=0
         }         
         var correlationStrength = "";
         var correlationTrend = "";
         
        if(r > 0.5 || r < -0.5){
             correlationStrength = "strong";
         } else if (r > 0.3 || r < -0.3){
             correlationStrength = "moderate";
         } else if (r > 0.1 || r < -0.1){
             correlationStrength = "weak";
         } else if (r > 0.0 || r < 0.0){
             correlationStrength = "very Weak";
         } else {
             correlationStrength = "no";
         }

         if (r > 0.0){
            correlationTrend = "positive";
         } else if (r < 0.0){
             correlationTrend = "negative";
         } else {
             correlationTrend = "";
         }
         
         

         var maxY = Math.max(...yarray);
         var minY = Math.min(...yarray);

         var spearmanrho = new SpearmanRHO(xarray, yarray);
         
         var currentTimeStamp = new Date().getTime();
         currentTimeStamp = new Intl.DateTimeFormat('en-SG', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(currentTimeStamp);

         spearmanrho.calc()
           .then(rho =>

            this.setState({
            scatterplot: <Plot data={[{
                           x: xarray,
                           y: yarray,
                           type: 'scatter',
                           mode: 'markers',
                           marker: {color: 'blue'},
                           name: plotpointname,
                           showlegend: false,
                           hoverlabel: {namelength: -1}
                           },{
                           x: xarray,
                           y: predictedyarray,
                           type: 'lines',
                           mode: 'lines',
                           marker: {color: 'red'},
                           name: "Equation: " + equation,
                           hoverlabel: {namelength: -1}                          
                           }]}
                           layout={{
                              width: 1000, 
                              height: 700, 
                              title: "" + this.state.selectedvariable + " and " + this.state.selectedvariable2 + " has <b>" + correlationStrength + "</b> " + correlationTrend + " correlation<br>R: " + r + " and rho: " + rho.toFixed(2),
                              hovermode: 'closest',
                              xaxis: {
                                 title: this.state.selectedvariable,
                                 ticklen: 5,
                                 zeroline: false,
                                 gridwidth: 2,
                              },
                              yaxis: {
                                 title: this.state.selectedvariable2,
                                 ticklen: 5,
                                 zeroline: false,
                                 gridwidth: 2,
                              },
                              showlegend: true,
                              legend: {x: 0.28, y: 1.05, orientation: "h"}                       
                           }}
                        />,
            hideLoadingBar: true, //hide loading button
            currenttime: "Generated Time:" + currentTimeStamp, 
            }))
           .catch(err => console.error(err));       
      });    
   } 

   //handle form submission
   formSubmitted(event){
      var x = document.getElementById("message");
         x.style.display = "none";

      event.preventDefault();
      this.generateScatterplot();
      this.setState({
         hideLoadingBar: false
      });      
   }        

   //rendering the html for chart
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};

      return (
         <div>
            <div style={{"width":"100%"}} className="content">
            <form action="/correlationpagebi">             
              <button className="back vis-back" type="submit">Back</button>  
            </form> 
            <br/>            
            <table style={{"width":"100%"}}>
            <tbody>
              <tr>            
                  <td>   
                  <form name="submitForm" method="POST" onSubmit={this.formSubmitted}>                       
                    <table align="left">
                      <tbody>
                        <tr>
                          <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                            <tr>
                              <td align="center">
                                <div className="cardtitle">
                                  1. Select Datasets
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <div className="cardsubtitle">
                                  Dataset One:  
                                </div>
                              </td>
                            </tr>
                            <tr>                             
                              <td align="center">
                                <select required defaultValue="" onChange={this.getVariables} style={{"width":"210px"}}>
                                  <option value="" disabled>- select a dataset -</option>
                                    {this.state.options}
                                </select>
                              </td>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>
                              <td align="center">
                                <div className="cardsubtitle">
                                  Dataset Two:  
                                </div>
                              </td>   
                            </tr>                         
                            <tr>
                              <td align="center">                                                
                                <select required defaultValue="" onChange={this.getVariables2} style={{"width":"210px"}}>
                                  <option value="" disabled>- select a dataset -</option>
                                    {this.state.options}
                                </select>
                              </td>
                            </tr><tr>
                              <td align="center">                  
                                <div className="carderrormsg">
                                  {this.state.errorstatement}
                                </div>
                              </td>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>        
                            </tr><tr>
                            </tr><tr>                     
                              <td align="center">
                                <div className="cardsubtitle">
                                  Combine both datasets based on:
                                </div>
                              </td>
                            </tr><tr>
                              <table align="center">
                                <tbody>
                                  <tr>                        
                                    <td><input id="dateradio" type="radio" name="joinvariable" value="activitydate" required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"} disabled required/><label id="labeldate">Activity Date</label></td>
                                    
                                    <td><input id="companyradio" type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"} disabled required/><label id ="labelcompany">Company</label></td>
                                  </tr><tr>
                                    <td><input id="locationradio" type="radio" name="joinvariable" value="countryname" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "countryname"} disabled required/><label id="labelcountry">Country Name</label></td>
                                                      
                                    <td><input id="depotradio" type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"} disabled required/><label id="labeldepot">Depot</label></td>                  
                                  </tr>
                                </tbody>
                              </table>
                            </tr>        
                          </td>
                          <td style={{"width":"2%", "height":"280px"}} valign="center" align="center">
                            <img src={arrowicon} width="45" height="45" />
                          </td>      
                          <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                            <tr>
                              <td align="center">                           
                                <div className="cardtitle">
                                  2. Select Variables
                                </div>
                              </td>
                            </tr><tr>
                              <td align="center">
                                <div className="cardsubtitle">
                                  Variable (X):
                                </div>
                              </td>
                            </tr><tr>
                              <td align="center">
                                <select id="xvariabledropdownid" required defaultValue="" onChange={this.selectVariable} style={{"width":"210px"}}>
                                  <option value="" disabled>- select a variable -</option>
                                    {this.state.variablesoptions}
                                </select>
                              </td>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>
                            </tr><tr>
                              <td align="center">                        
                                <div className="cardsubtitle">
                                  Variable (Y):
                                </div>
                              </td>
                            </tr><tr>
                              <td align="center">
                                <select id="yvariabledropdownid" required defaultValue="" onChange={this.selectVariable2} style={{"width":"210px"}}>
                                  <option value="" disabled>- select a variable -</option>
                                    {this.state.variablesoptions2}
                                </select>
                              </td>
                            </tr>
                          </td>
                          <td style={{"width":"2%", "height":"280px"}} valign="center" align="center">
                            <img src={arrowicon} width="45" height="45" />
                          </td>  
                          <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                            <tr>
                              <td align="center">
                                <div className="cardtitle">
                                  3. Filtering
                                </div>
                              </td>
                            </tr><tr>
                              <td align="center">
                                <div className="cardsubtitle">
                                  Filter By:
                                </div>
                              </td>
                            </tr><tr>
                              <td align="center">       
                                <select id="filtervariabledropdownid" defaultValue="" onChange={this.selectFilterVariable} style={{"width":"210px"}}>
                                  <option value="">- optional -</option>
                                    {this.state.datevariablesoptions}
                                    {this.state.companyvariablesoptions}               
                                    {this.state.depotvariablesoptions}                 
                                    {this.state.countrynamevariablesoptions}
                                  <option disabled>----------</option>                                                                
                                    {this.state.datevariablesoptions2}
                                    {this.state.companyvariablesoptions2}              
                                    {this.state.depotvariablesoptions2}                
                                   {this.state.countrynamevariablesoptions2}                                              
                                </select>
                              </td>
                            </tr>
                            <tr>
                               <td align="center">
                                  <div className="carderrormsg">{this.state.errordatestatement}</div>
                               </td>
                            </tr>
                            <tr>
                               <td align="center">  
                                  {this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                                     <div>
                                        <div className="cardsubtitle">
                                           Start Date:
                                        </div>                   
                                        <input type="date" style={{"width":"210px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue} />
                                        <td></td>
                                        <div className="cardsubtitle">
                                           End Date:
                                        </div>
                                        <input type="date" style={{"width":"210px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue2} />
                                        <br/>
                                        <tr>
                                        <td align="center">
                                           <font size="2" color="grey"><i>Safari users, please use "yyyy-mm-dd"</i></font>
                                        </td>
                                        </tr>
                                     </div>
                                  }
                                  {this.state.selectedfiltervariable && !this.state.selectedfiltervariable.toLowerCase().includes("date") &&
                                     <div>
                                        <div className="cardsubtitle">
                                           {this.state.selectedfiltervariable.substring(3,)}:
                                        </div>
                                        <select id="filtervaluedropdownid" defaultValue="" required onChange={this.selectFilterValue} style={{"width":"210px"}}>
                                           <option value="" disabled>- select a variable -</option>
                                           {this.state.filtervaluelistoptions}                         
                                        </select>
                                        <br/>
                                     </div>
                                  }  
                               </td>
                          </tr>
                          <tr>
                            <td align="center">                                                            
                              <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"240px"}}>Generate Scatterplot</button>                             
                            </td>
                          </tr><tr>
                          </tr><tr>
                          </tr><tr>                          
                          </tr><tr>
                            <td align="center">                                                            
                              <div className="LoadingBar" style={style}>
                                {this.loadingBarInstance}
                              </div>                                  
                            </td>
                          </tr>
                    </td></tr>
                    </tbody>   
                    </table>
                    <br/>          
                  </form>                   
                  </td>
                  </tr>
                  <br/>
                  <tr>
                  <td align="center" style={{"width":"80%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"10px"}} bgcolor="white">
                     <table id="message">
                       <tbody>
                          <tr>
                             <td align="center" style={{"width":"60%", "height":"580px", "borderRadius":"12px", "padding":"20px"}} bgcolor="white">
                                <label style={{"verticalAlign":"center"}}>Plot Display Area</label>          
                             </td>                           
                          </tr>
                       </tbody>   
                     </table>
                     <div style={{"width":"100%"}}>
                     {this.state.scatterplot}
                     </div>
                    <small>{this.state.currenttime}</small>
                  </td>
                  </tr>
            </tbody>   
            </table>             
            </div>                                 
         </div>
      );
   }
}
export default Chartbi;