import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import regression from 'regression';
import Correlation from 'node-correlation';
import SpearmanRHO from 'spearman-rho';

import "../css/main";
import arrowicon from "../images/arrow.png";

var $ = require('jquery');

class AutoChartbi extends Component {  
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
         scatterplots: "",
         selectedfiltervalue: "",
         selectedfiltervalue2: "", 
         datevariablesoptions: "", 
         datevariablesoptions2: "",        
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
         radioButtonCount: "",
         hideLoadingBar: true,
         variables1 : "",
         variables2 : "",
         selectedvariables1 : "",
         selectedvariables2 : "",
         rtworesults : "",
         filterresultoptions: "",
         filterwords1 : "",
         filterwords2: "",
         rxyKeyValues : "",
         correlationresultexplanation : "",
         instruction: "",
         selectedfiltervariable: "",
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
         errordatestatement: "",
         regenerate: "",
         currenttime: "",
      };
      
     

      this.getMySQLTables = this.getMySQLTables.bind(this);

      this.getVariables = this.getVariables.bind(this);  
      this.getVariables2 = this.getVariables2.bind(this);

      this.createVariables = this.createVariables.bind(this);   
      this.createVariablesOptions = this.createVariablesOptions.bind(this);

      this.validateDateRange = this.validateDateRange.bind(this);
      this.selectJoinVariable = this.selectJoinVariable.bind(this);     
      this.selectFilterVariable = this.selectFilterVariable.bind(this); 
      this.selectFilterValue = this.selectFilterValue.bind(this);  
      this.selectFilterValue2 = this.selectFilterValue2.bind(this);  
      this.resetfiltervariabledropdown = this.resetfiltervariabledropdown.bind(this);  
      this.resetfiltervaluedropdown = this.resetfiltervaluedropdown.bind(this);  
      
      this.displayChart = this.displayChart.bind(this);
      
      this.checkradiobutton = this.checkradiobutton.bind(this);
      this.checksubmitbutton = this.checksubmitbutton.bind(this);
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);

      this.generateScatterplot = this.generateScatterplot.bind(this); 

      this.formSubmitted = this.formSubmitted.bind(this);

      this.callBackendAPI = this.callBackendAPI.bind(this);

      this.getMySQLTables(); //retrieving user's uploaded tables
      
      this.filterresults = this.filterresults.bind(this);

      this.loadingBarInstance = (
         <div className="loader"></div>                                   
      );    
      

   }

   //retrieving user's uploaded tables   
   getMySQLTables() {
      var mySQLTables = "";
      this.callBackendAPI("/get_all_dataset_api")
      .then(res => {
         var datasetNames = res.datasetNames;
         var mySQLTables = [];
         datasetNames.map((datasetName, key) =>
            mySQLTables.push(datasetName.name)
         );
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
   
   selectFilterValue(event) {
      let regenerate = [];
      if(this.state.selectedfiltervariable.toLowerCase().includes("date")){
            this.validateDateRange(event.target.value, this.state.selectedfiltervalue2);
      }
      regenerate.push(<button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Regenerate R</button>);
      this.setState({
         selectedfiltervalue: event.target.value,
         regenerate : regenerate,
      });
   } 

   //store the  filter values 2 (if any) that the user has selected
   selectFilterValue2(event) {    
      let regenerate = [];
      if(this.state.selectedfiltervariable.toLowerCase().includes("date")){
         this.validateDateRange(this.state.selectedfiltervalue, event.target.value);
      }
      regenerate.push(<button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Regenerate R</button>);
      this.setState({
         selectedfiltervalue2: event.target.value,
         regenerate : regenerate,
      });
   } 
      
    resetfiltervariabledropdown(){
          this.setState({
             selectedfiltervariable: "",
             selectedfiltervalue: "",
             regenerate: "",
          });
          document.getElementById("filtervariabledropdownid").selectedIndex = -1;
    }

       
   resetfiltervaluedropdown(){
      this.setState({
         selectedfiltervalue : "",
         regenerate: "",
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


   //retrieving variables from flask
   getVariables(event) {
      this.setState({
         selectedtable: event.target.value
      });
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
         this.checkradiobutton(countrynamevariablelistdata, this.state.countrynamevariablesoptions2, "locationradio","labelcountry");
         
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
         this.checkradiobutton(countrynamevariablelistdata, this.state.countrynamevariablesoptions, "locationradio", "labelcountry");
         
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
      var variablelist = [];
      if (variablelistdata.toString().replace(/\s/g, '').length) { //checking data is not empty 
         variablelist = variablelistdata.toString().split(",");

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
            variables1 : variablelist,
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
            variables2 : variablelist,
         });           
      }
   }

  

   //store the variable that the user has selected
   selectJoinVariable(event) {
      this.setState({
         selectedjoinvariable: event.target.value
      });      
   }

   //retrieving chart data from flask and creating chart using plotly
   generateScatterplot(event) {
      var allscatterplots = [];
      var rxyKeyVal = {};
      $.post(window.location.origin + "/autoscatterplotdatabi/",
      {
         selectedtable: this.state.selectedtable,
         selectedtable2: this.state.selectedtable2,            
         selectedvariables1: '"' + this.state.variables1 + '"',
         selectedvariables2: '"' + this.state.variables2 + '"',    
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
        
        var xVariables = this.state.variables1;
        var yVariables = this.state.variables2;

        var currentXNo = 0;
        var currentYNo = 0;

        $.each(data,function(key,val){
            
         var xarray = [];
         var yarray = [];
         for(let i = 0; i < val.length; i++){
            if(xarray == "") {
               xarray = val[i].toString().split(",").map(Number);
            } else {
               yarray = val[i].toString().split(",").map(Number);
            }   
        }
         var twoDArray = [];
            
         for (var i = 0; i < xarray.length; i++) { //2D array needed for regression calculation only
            twoDArray.push([xarray[i], yarray[i]]);
         }
         var result = regression.linear(twoDArray);
         var gradient = result.equation[0];
         var yIntercept = result.equation[1];
         //var r2 = result.r2.toFixed(2);

         var equation = result.string;
         var r = Correlation.calc(xarray, yarray).toFixed(2); //rounding r to 2 decimal place
         
         var xname = xVariables[currentXNo];
         var yname = yVariables[currentYNo];
         
         if(rxyKeyVal[r]){
            rxyKeyVal[r].push([xname,yname,xarray,yarray]);
         } else {
            rxyKeyVal[r] = [[xname,yname, xarray, yarray]];          
         }
         if(currentYNo < yVariables.length-1){
            currentYNo++;
         } else {
            currentXNo++;
            currentYNo = 0;
         }
         

        });

        var arrowelement = document.getElementById("arrowclassid");
        arrowelement.style.visibility = "visible";
        var tablerowdataelement = document.getElementById("tablerowdataid");
        tablerowdataelement.style.visibility = "visible";

        var keys = Object.keys(rxyKeyVal);
        keys.sort(function ( a, b ) { return b - a; });
        let rxypairs = [<tr><th>X</th><th>Y</th><th>R</th></tr>]
        var filteroptions = [];
        
        for ( var i = 0; i < keys.length; i++ ) {
            filteroptions.push(<option value={i+1}>{i+1}</option>);
            for( var j = 0; j < rxyKeyVal[keys[i]].length; j++){
            rxypairs.push(<tr class="rxytr" onClick={this.displayChart}><input type="text" name="xval[]" value={rxyKeyVal[keys[i]][j][2]} hidden/><input type="text" name="yval[]" value={rxyKeyVal[keys[i]][j][3]} hidden/><td>{rxyKeyVal[keys[i]][j][0]}</td><td>{rxyKeyVal[keys[i]][j][1]}</td><td>{keys[i]}</td></tr>);
            }
        }
        this.setState({instruction: [<i>click row to view result</i>]});
        this.setState({hideLoadingBar: true, rtworesults:rxypairs, rxyKeyValues:rxyKeyVal});
         
         if(keys.length > 0){
             this.setState({
                 filterwords1 : "Filter by top ",
                 filterwords2 : " R's result",
                 filterresultoptions : <select required defaultValue={keys.length} onChange={this.filterresults}> + {filteroptions} + </select>
             });
         }

      });
        
    }
    
    filterresults(event){
        var rxyKeyVal = this.state.rxyKeyValues;
        var keys = Object.keys(rxyKeyVal);
        keys.sort(function ( a, b ) { return b - a; });
        let rxypairs = [<tr><th>X</th><th>Y</th><th>R</th></tr>]
        for ( var i = 0; i < event.target.value; i++ ) {
            for( var j = 0; j < rxyKeyVal[keys[i]].length; j++){
            rxypairs.push(<tr class="rxytr" onClick={this.displayChart}><input type="text" name="xval[]" value={rxyKeyVal[keys[i]][j][2]} hidden/><input type="text" name="yval[]" value={rxyKeyVal[keys[i]][j][3]} hidden/><td>{rxyKeyVal[keys[i]][j][0]}</td><td>{rxyKeyVal[keys[i]][j][1]}</td><td>{keys[i]}</td></tr>);
            }
        }
        this.setState({hideLoadingBar: true, rtworesults:rxypairs});
        
        
    }
    
    displayChart(event){
        
        $(".rxytr").click(function(){
            $(this).addClass("selected").siblings().removeClass("selected");
        });
        
        
        var plotpointname = "";
        var index = event.currentTarget.rowIndex;
        var currentrow = document.body.getElementsByClassName("rxytr")[index-1];

      
        var xname = currentrow.childNodes[2].textContent;
        var yname = currentrow.childNodes[3].textContent;
        
        var xarray = currentrow.childNodes[0].value.split(",").map(Number);
        var yarray = currentrow.childNodes[1].value.split(",").map(Number);
        
        
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
         var correlationStrength = "";
         var correlationTrend = "";
         
         if(r > 0.5 || r < -0.5){
             correlationStrength = "Strong";
         } else if (r > 0.3 || r < -0.3){
             correlationStrength = "Moderate";
         } else if (r > 0.1 || r < -0.1){
             correlationStrength = "Weak";
         } else if (r > 0.0 || r < 0.0){
             correlationStrength = "Very Weak";
         } else {
             correlationStrength = "No";
         }

         if (r > 0.0){
            correlationTrend = "Positive";
         } else if (r < 0.0){
             correlationTrend = "Negative";
         } else {
             correlationTrend = "";
         }
         
         var maxY = Math.max(...yarray);
         var minY = Math.min(...yarray);
         
         var spearmanrho = new SpearmanRHO(xarray, yarray);
         
         var currentTimeStamp = new Date().getTime();
         currentTimeStamp = new Intl.DateTimeFormat('en-SG', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(currentTimeStamp);
         
         var x = document.getElementById("message");
         x.style.display = "none";
         
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
                              title: "<b>" + xname + " and " + yname + " has " + correlationStrength + " " + correlationTrend + " correlation</b><br>R: " + r + " and rho: " + rho.toFixed(2),
                              hovermode: 'closest',
                              xaxis: {
                                 title: xname,
                                 ticklen: 5,
                                 zeroline: false,
                                 gridwidth: 2,
                              },
                              yaxis: {
                                 title: yname,
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

    }

   //handle form submission
   formSubmitted(event){
      var x = document.getElementById("generatemessage");
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
            <table id="innertable">
            <tbody>
               <tr>             
                  <td>   
                  <form name="submitForm" method="POST" onSubmit={this.formSubmitted}>                       
                     <table style={{"width":"100%"}} align="left">
                     <tbody>
                        <tr>
                        <td class="tablerowdata" valign="top" align="center" bgcolor="white">
                            <tr>
                               <td align="center">
                                  <div className="cardtitle">
                                     1. Select Datasets
                                  </div>
                               </td>
                            </tr><tr>
                               <td align="center">
                                  <div className="cardsubtitle">
                                     Dataset One:
                                  </div>
                               </td>
                            </tr><tr>
                               <td align="center">
                                  <select required defaultValue="" onChange={this.getVariables} style={{"width":"210px"}}>
                                     <option value="" disabled>- select a dataset -</option>
                                     {this.state.options}
                                  </select>
                               </td>
                            </tr><tr>
                               <td align="center">                        
                                  <div className="cardsubtitle">
                                     Dataset Two:
                                  </div>
                               </td>
                            </tr><tr>
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
                            </tr>
                            <tr>
                               <td align="center">
                                  <div className="cardsubtitle">
                                     Combine both datasets based on:
                                  </div>
                               </td>
                            </tr><tr>
                               <table align="center">
                               <tbody>
                                  <tr>                        
                                     <td><input id="dateradio" type="radio" name="joinvariable" value="activitydate" required onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "activitydate"} disabled required/></td><td><label id="labeldate">Activity Date</label></td>
                                  
                                      <td><input id="companyradio" type="radio" name="joinvariable" value="company" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "company"} disabled required/></td><td><label id ="labelcompany">Company</label></td>
                                  </tr><tr>
                                     <td><input id="locationradio" type="radio" name="joinvariable" value="countryname" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "countryname"} disabled required/></td><td><label id="labelcountry">Country Name</label></td>
                                                    
                                     <td><input id="depotradio" type="radio" name="joinvariable" value="depot" onChange={this.selectJoinVariable} checked={this.state.selectedjoinvariable === "depot"} disabled required/></td><td><label id="labeldepot">Depot</label></td>                  
                                  </tr>
                               </tbody>
                               </table>
                            </tr>       
                            <tr>
                               <td align="center">                                                            
                                  <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}}>Generate Top R</button>                             
                               </td>
                            </tr>
                        </td>
                         <td valign="center" align="center">
                            <img class="arrowclass" src={arrowicon} width="45" height="45" />
                          </td>
                        <td class="tablerowdata" valign="top" align="center" bgcolor="white">
                            <tr>
                              <td align="center">                           
                                <div className="cardtitle">
                                  2. Correlation Results
                                </div>
                              </td>
                            </tr>
                            <tr>
                                 <div id="generatemessage">
                                    <div className="cardsubtitle">
                                       Generate Top R to get results
                                    </div>         
                                  </div>                                
                                <td>
                                {this.state.filterwords1}
                                {this.state.filterresultoptions}
                                {this.state.filterwords2}
                                </td>
                            </tr>
                            <table id="rtwotables"  class="outputtable" border="1">
                            {this.state.rtworesults}                            
                            </table>
                            {this.state.instruction}
                            <br/>
                            <tr>
                               <td align="center">                                                        
                                  <div className="LoadingBar" style={style}>
                                     {this.loadingBarInstance}
                                  </div>                                  
                               </td>
                            </tr>
                        </td>
                         <td valign="center" align="center">
                            <img id="arrowclassid" class="arrowclass" src={arrowicon} width="45" height="45" />
                          </td>
                        <td id="tablerowdataid" class="tablerowdata" valign="top" align="center" bgcolor="white">                         
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
                                        <input type="date" style={{"width":"80%"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue} />
                                        <td></td>
                                        <div className="cardsubtitle">
                                           End Date:
                                        </div>
                                        <input type="date" style={{"width":"80%"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectFilterValue2} />
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
                                        <select id="filtervaluedropdownid" defaultValue="" required onChange={this.selectFilterValue}>
                                           <option value="" disabled>- select a variable -</option>
                                           {this.state.filtervaluelistoptions}                         
                                        </select>
                                        <br/>
                                     </div>
                                  }  
                               </td>
                          </tr>
                          <tr><td>
                          {this.state.regenerate}
                          </td>
                          </tr>
                        </td></tr>
                     </tbody>   
                     </table>
                     <br/>          
                  </form>                   
                  </td>
                  </tr>
                  <tr>
                  <td align="center" style={{"width":"80%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"10px"}} bgcolor="white">
                     <table id="message">
                     <tbody>
                        <tr>
                           <td align="center" style={{"width":"850px", "height":"580px", "borderRadius":"12px", "padding":"10px"}} bgcolor="white">
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
export default AutoChartbi;