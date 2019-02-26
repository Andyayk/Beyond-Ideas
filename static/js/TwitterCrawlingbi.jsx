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
         apiCallLimit: "",
         apiCallReset: "",
         tags: "",
         nooftweets: "",
         hideLoadingBar: true,            
      };

      this.twitterCrawler = this.twitterCrawler.bind(this);
      this.selectTags = this.selectTags.bind(this);        
      this.selectNoOfTweets = this.selectNoOfTweets.bind(this);    

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
         nooftweets: this.state.nooftweets
      },
      (data) => {
         var message = "";
         var twitterData = data['tweets'];
         var apiCallLimit = data['apicalllimit'];
         var apiCallReset = data['apicallreset'];      
         
         $.each(twitterData, function(key, val) {
            var element = document.createElement('a');
            var newContent = val.replace(/;/g, "\n")
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(newContent));
            element.setAttribute('download', 'tweets_test.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            message = "Crawling of weather data is successful.";
         });  

         this.setState({
            message: message,
            twitterData: twitterData,
            apiCallLimit: apiCallLimit,
            apiCallReset: apiCallReset,
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
                                    <input required type="number" id="nooftweets" onChange={this.selectNoOfTweets} min="1" max="45000"/>                    
                                 </td>
                              </tr><tr>
                                 <td align="center">
                                    <font size="2" color="grey"><i>Only tweets from the past 7 days will be retrieved</i></font>
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td align="center">
                                    <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Retrieve Tweets</button>    
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
                              No. of Tweets Retrieved: {this.state.twitterData.length}<br />   
                              No. of Twitter Requests Remaining: {this.state.apiCallLimit}<br />
                              Reset Limit at: {this.state.apiCallReset}<br />                              
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