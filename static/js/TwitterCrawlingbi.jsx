import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";

var $ = require('jquery');

class TwitterCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         twitterData: ""
      };

      this.getTwitterData = this.getTwitterData.bind(this);
      this.formSubmitted = this.formSubmitted.bind(this);      
   }
 
   //retrieving twitter data
   getTwitterData() { 
      $.getJSON(window.location.origin + "/twittercrawlingbi/", (data) => {
         var twitterData = "";
         $.each(data, function(key, val) {
            twitterData = val;
         });  

         this.setState({
            twitterData: twitterData
         });                        
      });
   }   

   //handle form submission
   formSubmitted(event){
      event.preventDefault();

   }

   //rendering the html for web crawling
   render() {
      return (
         <div>
            Twitter
            <br />
            <td align="center">                                                            
               <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}} onClick={this.getTwitterData}>Click Me!</button>
            </td>   
            Number of Tweets: {this.state.twitterData.length}<br />         

            {this.state.twitterData}    
         </div>
      );
   }
}
export default TwitterCrawlingbi;