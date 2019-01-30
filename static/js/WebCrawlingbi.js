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
            <div class="content">
               <table style={{"width":"100%", "padding":"10px"}}>
                  <tr>             
                     <td style={{"width":"49.8%", "box-shadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "border-radius":"12px", "padding":"15px"}} valign="top" align="center" bgcolor="white">       
                        <form method="POST" onSubmit={this.formSubmitted}>       
                           <br/>
                           <table align="center">
                              <tr>
                                 <td align="center">
                                    <font size="6" style={{"color":"#4D4DFF","weight":"bold"}}>Historical Weather</font>           
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <div class="cardtitle">
                                       Select Date Range
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <div class="cardsubtitle">
                                       Start Date: e.g 25/10/2018
                                    </div>          
                                 </td>
                              </tr><tr>
                                 <td align="center">                                
                                    <input type="date" style={{"width":"200px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectStartDate} />
                                 </td>
                              </tr><tr>
                                 <td align="center">                                                                 
                                    <div class="cardsubtitle">
                                       End Date: e.g 30/12/2018
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">                                
                                    <input type="date" style={{"width":"200px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectEndDate} />
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <div class="cardtitle">
                                       Select Country
                                    </div>
                                 </td> 
                              </tr><tr>                             
                                 <td align="center">
                                    <div class="cardsubtitle">
                                       Country: e.g. Singapore
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <select required onChange={this.selectCountryName} style={{"width":"200px"}}>
                                       <option value="" selected>-------- select a country --------</option>
                                       <option value="Australia">Australia</option>
                                       <option value="Bangladesh">Bangladesh</option>
                                       <option value="Bhutan">Bhutan</option> 
                                       <option value="Brunei">Brunei</option> 
                                       <option value="Myanmar">Myanmar</option> 
                                       <option value="Cambodia">Cambodia</option> 
                                       <option value="China">China</option> 
                                       <option value="Chile">Chile</option> 
                                       <option value="Cook Islands">Cook Islands</option> 
                                       <option value="Fiji">Fiji</option> 
                                       <option value="India">India</option> 
                                       <option value="Indonesia">Indonesia</option> 
                                       <option value="Japan">Japan</option> 
                                       <option value="Kiribati">Kiribati</option> 
                                       <option value="Malaysia">Malaysia</option>  
                                       <option value="Maldives">Maldives</option>  
                                       <option value="Marshall Islands">Marshall Islands</option>  
                                       <option value="Micronesia">Micronesia</option>  
                                       <option value="Mongolia">Mongolia</option>  
                                       <option value="Nauru">Nauru</option>  
                                       <option value="New Zealand">New Zealand</option>  
                                       <option value="Niue">Niue</option>  
                                       <option value="Pakistan">Pakistan</option>  
                                       <option value="Palau">Palau</option>  
                                       <option value="Papua New Guinea">Papua New Guinea</option>  
                                       <option value="Peru">Peru</option>
                                       <option value="Philippines">Philippines</option>    
                                       <option value="Russia">Russia</option>  
                                       <option value="Samoa">Samoa</option>
                                       <option value="Singapore">Singapore</option>
                                       <option value="Solomon Island">Solomon Island</option>
                                       <option value="South Korea">South Korea</option>   
                                       <option value="Sri Lanka">Sri Lanka</option>
                                       <option value="Tuvalu">Tuvalu</option>   
                                       <option value="Vanuatu">Vanuatu</option>   
                                       <option value="Vietnam">Vietnam</option>
                                    </select>
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <button id="submitbutton" class="button" type="submit" style={{"vertical-align":"middle", "width":"220px"}}>Begin Crawling</button>    
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="red"><i>Note: Process will be longer when date range is larger</i></font>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font color="green"><b>{this.state.message}</b></font>  
                                 </td>
                              </tr>
                              <br/>
                           </table>
                        </form> 
                     </td><td></td>
                     <td align="center" style={{"width":"49.8%", "box-shadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "border-radius":"12px", "padding":"12px"}} bgcolor="white">
                        <font size="5" style={{"color":"#fecb2f","weight":"bold"}}>Under Construction</font>           
                     </td>
                  </tr>
               </table>                   
            </div>
         </div>
      );
   }
}
export default WebCrawlingbi;