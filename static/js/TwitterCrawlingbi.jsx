import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";
import TwitterIcon from "../images/TwitterIcon.png";
import arrowicon from "../images/arrow.png";


var $ = require('jquery');

class TwitterCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         message: "",
         twitterData: [],
         apiCallLimit: "-",
         apiCallReset: "15 Minutes*",
         filename: "",
         tags: "",
         nooftweets: "",
         save: "",         
         hideLoadingBar: true, 
         datebefore: "",                    
      };

      this.twitterCrawler = this.twitterCrawler.bind(this);
      this.selectTags = this.selectTags.bind(this);        
      this.selectNoOfTweets = this.selectNoOfTweets.bind(this);    
      this.selectDateBefore = this.selectDateBefore.bind(this);

      this.switchToDatabase = this.switchToDatabase.bind(this);
      this.switchToCSV = this.switchToCSV.bind(this);      
      this.selectFilename = this.selectFilename.bind(this);      

      this.formSubmitted = this.formSubmitted.bind(this);     

      this.loadingBarInstance = (
         <div className="loader"></div>                                   
      );           
   }
 
   //retrieving twitter data
   twitterCrawler() { 
      var filename = this.state.filename;
      $.post(window.location.origin + "/twittercrawlingbi/",
      {
         tags: this.state.tags,
         nooftweets: this.state.nooftweets,
         datebefore: this.state.datebefore,
         save: this.state.save,
         filename: filename
      },
      (data) => {
         var message = "";
         var twitterData = data['tweets'];
         var apiCallLimit = data['apicalllimit'];
         var apiCallReset = data['apicallreset'];  

         if (!twitterData.includes("no tweets") && twitterData.length > 2) {   
            //console.log(twitterData)
            if (twitterData == "Successfully saved twitter data into the database"){
               message = "Successfully saved data into the database.";
            } else {            
               var element = document.createElement('a');
               var newContent = twitterData;
               element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
               element.setAttribute('download', filename + '.csv');
               element.style.display = 'none';
               document.body.appendChild(element);
               element.click();
               document.body.removeChild(element);
               message = "Successfully saved data into CSV file.";
            }
         }
         this.setState({
            message: message,
            twitterData: twitterData,
            apiCallLimit: apiCallLimit,
            apiCallReset: apiCallReset,
            save: "",            
            hideLoadingBar: true, //hide loading button            
         });       

         var y = document.getElementById("messageArea");
         y.style.display = "block";
         var x = document.getElementById("csvButton");
         x.style.display = "block";

      }); 
   }   

   //store the file name that the user has selected
   selectFilename(event) {
      this.setState({
         filename: event.target.value
      });      
   }  

   //store the tags that the user has selected
   selectTags(event) {
      this.setState({
         tags: event.target.value
      });      
   }   

   //store the no. of tweets that the user has selected
   selectNoOfTweets(event) {
      this.setState({
         nooftweets: event.target.value
      });      
   }  

   //store the date values that the user has selected
   selectDateBefore(event) {
      this.setState({
         datebefore: event.target.value
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

   //handle form submission
   formSubmitted(event){
      event.preventDefault();
      this.twitterCrawler();      
      this.setState({
         hideLoadingBar: false
      });
      var y = document.getElementById("messageArea");
      y.style.display = "none";
      var x = document.getElementById("csvButton");
      x.style.display = "none";

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
                                    <img src={TwitterIcon} width="150" height="150" />
                                 </td>
                                 <td style={{"width":"2%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                                 <td style={{"width":"28%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center"></td>
                              </tr>
                              <br/>
                              <tr> 
                                 <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          1. Enter Tag(s)
                                       </div>
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          e.g. "dhl, innovation"
                                       </div>
                                    </tr><tr>
                                       <input required type="text" id="tags" style={{"width":"220px"}} onChange={this.selectTags}/>
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>                                    
                                       <div className="cardhintmessage">
                                          *Separate multiple tags with commas
                                       </div>                            
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>                                    
                                    </tr><tr>                                    
                                       <div className="cardsubtitle">
                                          No. of Tweets to Retrieve:
                                       </div>
                                    </tr><tr>
                                       <input required type="number" id="nooftweets" style={{"width":"220px"}} onChange={this.selectNoOfTweets} min="100" max="2000"/>                    
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>                                        
                                       <div className="cardhintmessage">
                                          *Rounded up to the nearest hundreds
                                       </div>
                                    </tr>
                                 </td>
                                 <td style={{"width":"2%", "height":"280px"}} valign="center" align="center">
                                    <img src={arrowicon} width="45" height="45" />
                                 </td>                                     
                                 <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          2. Enter Date
                                       </div>
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          Date:
                                       </div>
                                    </tr><tr>
                                       <input type="date" min="1900-01-01" max="2100-12-31" style={{"width":"220px"}} required onChange={this.selectDateBefore} />
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr>                                        
                                       <div className="cardhintmessage">
                                          *Only tweets from the past 7 days will be retrieved
                                       </div>                          
                                    </tr><tr>
                                       <div className="cardhintmessage">
                                          *Safari users, please use "yyyy-mm-dd"
                                       </div>
                                    </tr>
                                 </td>
                                 <td style={{"width":"2%", "height":"280px"}} valign="center" align="center">
                                    <img src={arrowicon} width="45" height="45" />
                                 </td>                                      
                                 <td style={{"width":"28%", "height":"280px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          3. Enter Dataset Name
                                       </div>
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          e.g. "dhltweets"
                                       </div>
                                    </tr><tr>
                                       <input required type="text" id="filename" onKeyPress={(e) => this.validation(e)} style={{"width":"220px"}} onChange={this.selectFilename}/>
                                    </tr><tr>
                                       <button onClick={this.switchToDatabase} id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Retrieve Tweets</button>    
                                    </tr><tr>
                                    </tr><tr>
                                    </tr><tr> 
                                       <div className="cardhintmessage">
                                          No. of Twitter Requests Remaining: {this.state.apiCallLimit}
                                       </div>                         
                                    </tr><tr>
                                       <div className="cardhintmessage">
                                          (Reset at: {this.state.apiCallReset})
                                       </div> 
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
export default TwitterCrawlingbi;