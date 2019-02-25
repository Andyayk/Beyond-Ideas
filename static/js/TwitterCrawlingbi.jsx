import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";

var $ = require('jquery');

class TwitterCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         twitterData: [],
         apiCallLimit: "",
         apiCallReset: ""
      };

      this.getTwitterData = this.getTwitterData.bind(this);
      this.formSubmitted = this.formSubmitted.bind(this);      
   }
 
   //retrieving twitter data
   getTwitterData() { 
      $.getJSON(window.location.origin + "/twittercrawlingbi/", (data) => {
         var twitterData = [];
         var apiCallLimit = [];
         var apiCallReset = [];
         $.each(data, function(key, val) {
            if(twitterData == "") {
               twitterData = val;
            } else if(apiCallLimit == "") {
               apiCallLimit = val.toString();
            } else {
               apiCallReset = val.toString();
            }
         });  

         this.setState({
            twitterData: twitterData,
            apiCallLimit: apiCallLimit,
            apiCallReset: apiCallReset
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
            <td align="center">                                                            
               <button id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle"}} onClick={this.getTwitterData}>Click Me!</button>
            </td>   
            Number of Tweets Retrieved: {this.state.twitterData.length}<br />   
            Number of Twitter Requests Remaining: {this.state.apiCallLimit}<br />
            Reset at: {this.state.apiCallReset}<br /><br />
            <table className="outputtable" style={{"width":"1150px","maxWidth":"1150px"}}>
            <tbody>            
               {this.state.twitterData.map((combinedrows, key)=><tr key={key}>{combinedrows.map((combinedrow)=><td><center>{combinedrow}</center></td>)}</tr>)}  
            </tbody>            
            </table>
         </div>
      );
   }
}
export default TwitterCrawlingbi;