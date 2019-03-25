import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";
import WeatherCrawlIcon from "../images/WeatherIcon.png";
import arrowicon from "../images/arrow.png";

var $ = require('jquery');

class WebCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         message: "",
         startdate: "",
         enddate: "",
         countryname: "",
         filename: "",        
         save: "",
         errordatestatement: "",
         hideLoadingBar: true,         
      };

      this.validateDateRange = this.validateDateRange.bind(this);      
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);
      this.selectStartDate = this.selectStartDate.bind(this); 
      this.selectEndDate = this.selectEndDate.bind(this);

      this.selectCountryName = this.selectCountryName.bind(this);  
      this.selectFilename = this.selectFilename.bind(this);                
      this.switchToDatabase = this.switchToDatabase.bind(this);
      this.switchToCSV = this.switchToCSV.bind(this);           
      this.weatherCrawler = this.weatherCrawler.bind(this);

      this.formSubmitted = this.formSubmitted.bind(this);  

      this.loadingBarInstance = (
         <div className="loader"></div>                                   
      );    
   }
   
   validateDateRange(fromDate, toDate){
      if(fromDate && toDate && fromDate > toDate){
         this.setState({
            errordatestatement: "Please select a valid date range"
         });
         this.enablesubmitbutton(false);
      } else {
         this.setState({errordatestatement: ""});
         this.enablesubmitbutton(true);
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

         var element2 = document.getElementById('submitbutton2');
         element2.disabled = false;
         element2.style.background = "#fecb2f";
         element2.style.color = "black";                  
         element2.style.opacity = "1";            
         element2.style.cursor = "pointer";         
      } else {
         var element = document.getElementById('submitbutton');
         element.disabled = true;
         element.style.background = "red";
         element.style.color = "white";         
         element.style.opacity = "0.6";
         element.style.cursor = "not-allowed";

         var element2 = document.getElementById('submitbutton2');
         element2.disabled = true;
         element2.style.background = "red";
         element2.style.color = "white";         
         element2.style.opacity = "0.6";
         element2.style.cursor = "not-allowed";         
      }
   }
   
   //store the start date values that the user has selected
   selectStartDate(event) {
      this.validateDateRange(event.target.value,this.state.enddate);
      this.setState({
         startdate: event.target.value
      });      
   }

   //store the end date values that the user has selected
   selectEndDate(event) {
      this.validateDateRange(this.state.startdate,event.target.value);
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

   selectFilename(event) {
      this.setState({
         filename: event.target.value
      });      
   }      

   //switch between saving to database (true) or CSV file
   switchToDatabase(){
      this.setState({
         save: "true"
      });
   }  

   //switch between saving to database (true) or CSV file
   switchToCSV(){
      this.setState({
         save: ""
      });
   }    

   validation(e) {
      const re = /[0-9a-zA-Z_ ]+/g;
      if (!re.test(e.key)) {
         e.preventDefault();
      }
   }

   //retrieve web crawl results
   weatherCrawler(event){
      var country = this.state.countryname;
      var begindate = this.state.startdate;
      var finishdate = this.state.enddate;
      var saveToDB = this.state.save;
      var filename = this.state.filename;
      $.post(window.location.origin + "/weathercrawlingbi/",
      {
         startdate: begindate,
         enddate: finishdate,
         countryname: country,
         filename: filename,      
         save: saveToDB
      },
      (data) => {
         var message = ""; 
         $.each(data, function(key, val) {
            //console.log(val)
            if (val == "success"){
               message = "Successfully saved data into database.";
            } else {
               var element = document.createElement('a');
               var newContent = val.replace(/;/g, "\n");
               element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
               element.setAttribute('download', filename + '.csv');
               element.style.display = 'none';
               document.body.appendChild(element);
               element.click();
               document.body.removeChild(element);
               message = "Successfully saved data into CSV file.";
            }
         });  

         this.setState({
            message: message,
            save: "",
            hideLoadingBar: true, //hide loading button
         });  
         var y = document.getElementById("messageArea");
         y.style.display = "block";
         var x = document.getElementById("csvButton");
         x.style.display = "block";

         //console.log("came to line 135")    
         //console.log(save)                  
      });
   }


   //handle form submission
   formSubmitted(event){
      event.preventDefault();
      this.weatherCrawler();
      this.setState({
         hideLoadingBar: false
      });

      var x = document.getElementById("csvButton");
      x.style.display = "none";
      var y = document.getElementById("messageArea");
      y.style.display = "none";
   }

   //rendering the html for web crawling
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};

      return (
         <div>
            <div className="content">
               <form action="/webcrawlingpagebi"> 
                  <button className="back vis-back" type="submit">Back</button>  
               </form>                         
               <table style={{"width":"100%"}}>
               <tbody>
                  <tr>          
                     <td>       
                        <form method="POST" onSubmit={this.formSubmitted}>       
                           <table align="left">
                           <tbody>
                              <tr>
                                 <td style={{"width":"28%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                                 <td style={{"width":"2%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                                 <td style={{"width":"28%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center">
                                    <img src={WeatherCrawlIcon} width="150" height="150" />
                                 </td>
                                 <td style={{"width":"2%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                                 <td style={{"width":"28%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                              </tr>
                              <br/>
                              <tr>
                                 <td style={{"width":"28%", "height":"250px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          1. Select Date Range
                                       </div>                                    
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          Start Date:
                                       </div>          
                                    </tr><tr>
                                       <input type="date" style={{"width":"220px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectStartDate} />
                                    </tr><tr>
                                    </tr><tr>                                    
                                    </tr><tr>                                    
                                       <div className="cardsubtitle">
                                          End Date:
                                       </div>
                                    </tr><tr>
                                       <input type="date" style={{"width":"220px"}} min="1900-01-01" max="2100-12-31" required onChange={this.selectEndDate} />
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr> 
                                       <div className="cardhintmessage">
                                          Safari users, please use "yyyy-mm-dd"
                                       </div>
                                    </tr><tr>
                                       <div className="carderrormsg">{this.state.errordatestatement}</div>
                                    </tr>
                                 </td>
                                 <td style={{"width":"2%", "height":"250px"}} valign="center" align="center">
                                    <img src={arrowicon} width="45" height="45" />
                                 </td>                                 
                                 <td style={{"width":"28%", "height":"250px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          2. Select Country
                                       </div>                                  
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          Country:
                                       </div>
                                    </tr><tr>
                                       <select required defaultValue="" onChange={this.selectCountryName} style={{"width":"220px"}}>
                                          <option value="" disabled>- select a country -</option>
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
                                    </tr>
                                 </td>
                                 <td style={{"width":"2%", "height":"250px"}} valign="center" align="center">
                                    <img src={arrowicon} width="45" height="45" />
                                 </td>                                   
                                 <td style={{"width":"28%", "height":"250px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>   
                                       <div className="cardtitle">
                                          3. Enter Dataset Name
                                       </div>
                                    </tr><tr>
                                       <div className="cardsubtitle">
                                          e.g. "sgweather"
                                       </div>
                                    </tr><tr>
                                       <td align="center">
                                          <input required type="text" id="filename" onKeyPress={(e) => this.validation(e)} style={{"width":"220px"}} onChange={this.selectFilename}/>
                                       </td>
                                    </tr>
                                    <tr>
                                       <td align="center">
                                          <button onClick={this.switchToDatabase} id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Retrieve Weather Data</button>    
                                       </td>                                                              
                                    </tr><tr>
                                       <div id="messageArea" style={{"display":"none"}}> 
                                          <font color="green"><b>{this.state.message}</b></font>   
                                       </div>                                 
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>
                                       <div id="csvButton" style={{"display":"none"}}>
                                          <button onClick={this.switchToCSV} id="submitbutton2" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Save as CSV file?</button>    
                                       </div>
                                    </tr><tr>
                                       <div className="LoadingBar" style={style}>
                                          {this.loadingBarInstance}
                                       </div>                                    
                                    </tr>
                                 </td>
                              </tr>
                           </tbody>   
                           </table>
                        </form> 
                     </td>
                  </tr>         
               </tbody>     
               </table>   
            </div>
         </div>
      );
   }
}
export default WebCrawlingbi;