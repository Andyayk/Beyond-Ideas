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
         tags: "",
         nooftweets: "",
         save: "",         
         hideLoadingBar: true,            
      };

      this.twitterCrawler = this.twitterCrawler.bind(this);
      this.selectTags = this.selectTags.bind(this);        
      this.selectNoOfTweets = this.selectNoOfTweets.bind(this);    

      this.btnClick = this.btnClick.bind(this);

      this.formSubmitted = this.formSubmitted.bind(this);     

      this.loadingBarInstance = (
         <div className="loader"></div>                                   
      );           
   }
 
   //retrieving twitter data
   twitterCrawler() { 
      $.post(window.location.origin + "/twittercrawlingbi/",
      {
         tags: this.state.tags,
         nooftweets: this.state.nooftweets,
         save: this.state.save
      },
      (data) => {
         var message = "";
         var twitterData = data['tweets'];
         var apiCallLimit = data['apicalllimit'];
         var apiCallReset = data['apicallreset'];  

         if (!twitterData.includes("no tweets") && twitterData.length > 2) {   
            //console.log(twitterData)
            if (twitterData == "Successfully saved twitter data into the database"){
               message = "Successfully saved twitter data into the database."
            } else {            
               var element = document.createElement('a');
               var newContent = twitterData
               element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
               element.setAttribute('download', 'tweets.csv');
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

   //switch between saving to database (true) or CSV file
   btnClick(){
      this.setState({
         save: "true"
      });
   }      

   //handle form submission
   formSubmitted(event){
      event.preventDefault();
      this.twitterCrawler();      
      this.setState({
         hideLoadingBar: false
      });
   }

   //rendering the html for web crawling
   render() {
      const style = this.state.hideLoadingBar ? {display: 'none'} : {};

      return (
         <div>      
            <div className="content">
               <table style={{"width":"100%", "padding":"10px"}}>
               <tbody>
                  <tr>             
                     <td style={{"width":"49.8%", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px", "padding":"15px"}} valign="top" align="center" bgcolor="white">       
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
                                    <input required type="text" id="tags" onChange={this.selectTags}/>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Only tweets from the past 7 days will be retrieved</i></font>                             
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
                                    <input required type="number" id="nooftweets" onChange={this.selectNoOfTweets} min="100" max="5000"/>                    
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>No. of tweets will be rounded up to the nearest hundreds</i></font>
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <button onClick={this.btnClick.bind(this)} id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Save into Database</button>    
                                 </td>                                                              
                              </tr><tr>
                                 <td align="center">
                                    <div className="cardtitle">                                 
                                    Or
                                    </div>
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <button id="submitbutton2" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Save as CSV File</button>    
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2"><i>No. of Twitter Requests Remaining: {this.state.apiCallLimit} (Reset at: {this.state.apiCallReset})</i></font>                          
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <font color="green"><b>{this.state.message}</b></font>  
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
            </div>
         </div>
      );      
   }
}
export default TwitterCrawlingbi;