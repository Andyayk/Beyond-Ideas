import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";
import TwitterIcon from "../images/twitter.png";

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
               message = "Successfully saved twitter data into the database.";
            } else {            
               var element = document.createElement('a');
               var newContent = twitterData;
               element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
               element.setAttribute('download', filename + '.csv');
               element.style.display = 'none';
               document.body.appendChild(element);
               element.click();
               document.body.removeChild(element);
               message = "Successfully saved twitter data into CSV file.";
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
               <table style={{"width":"100%"}}>
               <tbody>
                  <tr>             
                     <td style={{"boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">       
                        <form method="POST" onSubmit={this.formSubmitted}>       
                           <br/>
                           <table align="center">
                           <tbody>
                              <tr>
                                 <td align="center">
                                    <img src={TwitterIcon} width="100" height="100" />
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <div className="cardtitle">
                                       Enter Tags
                                    </div>
                                 </td> 
                              </tr><tr>                             
                                 <td align="center">
                                    <div className="cardsubtitle">
                                       Tags:
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <input required type="text" id="tags" style={{"width":"220px"}} onChange={this.selectTags}/>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Separate multiple tags with commas</i></font><br/>                            
                                 </td>
                              </tr><br/><tr>
                                 <td align="center">
                                    <div className="cardtitle">
                                       Enter No. of Tweets
                                    </div>
                                 </td> 
                              </tr><tr>                             
                                 <td align="center">
                                    <div className="cardsubtitle">
                                       No. of Tweets:
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <input required type="number" id="nooftweets" style={{"width":"220px"}} onChange={this.selectNoOfTweets} min="100" max="5000"/>                    
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Rounded up to the nearest hundreds</i></font>
                                 </td>
                              </tr><br/><tr>
                                 <td align="center">
                                    <div className="cardtitle">
                                       Before the Given Date
                                    </div>
                                 </td> 
                              </tr><tr>                             
                                 <td align="center">
                                    <div className="cardsubtitle">
                                       Date:
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">                                
                                    <input type="date" min="1900-01-01" max="2100-12-31" style={{"width":"220px"}} required onChange={this.selectDateBefore} />
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Only tweets from the past 7 days will be retrieved</i></font><br/>                            
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Safari users, please use "yyyy-mm-dd"</i></font>
                                 </td>
                              </tr><br/><tr>
                                 <td align="center">
                                    <div className="cardtitle">
                                       Enter File Name
                                    </div>
                                 </td> 
                              </tr>
                              <tr>                             
                                 <td align="center">
                                    <div className="cardsubtitle">
                                       File Name:
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <input required type="text" id="filename" style={{"width":"220px"}} onChange={this.selectFilename}/>
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <button onClick={this.switchToDatabase} id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Retrieve Tweets</button>    
                                 </td>                                                              
                              </tr><tr>
                                 <td align="center">
                                    <font size="2"><i>No. of Twitter Requests Remaining: {this.state.apiCallLimit} (Reset at: {this.state.apiCallReset})</i></font>                          
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <div id="messageArea" style={{"display":"none"}}> 
                                       <font color="green"><b>{this.state.message}</b></font>   
                                    </div>                                 
                                 </td>
                              </tr><tr>
                              </tr><tr>
                              </tr><tr>
                                 <td align="center">
                                    <div id="csvButton" style={{"display":"none"}}>
                                       <button onClick={this.switchToCSV} id="submitbutton2" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Save as CSV file?</button>    
                                    </div>
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <div className="LoadingBar" style={style}>
                                       {this.loadingBarInstance}
                                    </div>                                    
                                 </td>
                              </tr>
                              <br/>                           
                           </tbody>   
                           </table>
                        </form> 
                     </td>
                  </tr>              
               </tbody>   
               </table>  
               <br/> 
               <form action="/webcrawlingpagebi">             
                  <button className="back vis-back" type="submit">Back</button>  
               </form>                                   
            </div>
         </div>
      );      
   }
}
export default TwitterCrawlingbi;