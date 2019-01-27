import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";

var $ = require('jquery');

class WebCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         message: "",
         startdate: "",
         enddate: "",
         countryname: "",         
      };

      this.selectStartDate = this.selectStartDate.bind(this); 
      this.selectEndDate = this.selectEndDate.bind(this);

      this.selectCountryName = this.selectCountryName.bind(this);            

      this.weatherCrawler = this.weatherCrawler.bind(this);

      this.formSubmitted = this.formSubmitted.bind(this);      
   }

   //store the start date values that the user has selected
   selectStartDate(event) {
      this.setState({
         startdate: event.target.value
      });      
   }

   //store the end date values that the user has selected
   selectEndDate(event) {
      this.setState({
         enddate: event.target.value
      });      
   }

   //store the country values that the user has selected
   selectCountryName(event) {
      this.setState({
         countryname: event.target.value
      });      
   }    

   //retrieve web crawl results
   weatherCrawler(event){
      $.post(window.location.origin + "/weathercrawlingbi/",
      {
         startdate: this.state.startdate,
         enddate: this.state.enddate,
         countryname: this.state.countryname
      },
      (data) => {

         var message = "";
         $.each(data, function(key, val) {
            message = val;
         });  

         this.setState({
            message: message
         });                        
      });
   }

   //handle form submission
   formSubmitted(event){
      event.preventDefault();
      this.weatherCrawler();
   }

   //rendering the html for web crawling
   render() {
      return (
      <div>
         <font color="red">Note: Please be patient, web crawling takes some time</font>
         <br />
         <form method="POST" onSubmit={this.formSubmitted}>       
            <div>
               <div class="cardsubtitle">
                  Start Date: use 2018-10-25
               </div>                   
               <input type="date" min="1900-01-01" max="2100-12-31" required onChange={this.selectStartDate} />
               <br /><br />

               <div class="cardsubtitle">
                  End Date: use 2018-12-21
               </div>
               <input type="date" min="1900-01-01" max="2100-12-31" required onChange={this.selectEndDate} />
               <br /><br />
            </div>

            <div>
               <div class="cardsubtitle">
                  Country:
               </div>
               <select required onChange={this.selectCountryName}>
                  <option value="" selected>---------- select a variable ----------</option>
                  <option value="Singapore">Singapore</option>                                          
               </select>
               <br /><br />               
            </div>

            <button id="submitbutton" class="button" type="submit" style={{"vertical-align":"middle", "width":"220px"}}><span>Web Crawl!</span></button>    
         </form>           
         <br />
         <font color="green">{this.state.message}</font>  
      </div>
      );
   }
}
export default WebCrawlingbi;