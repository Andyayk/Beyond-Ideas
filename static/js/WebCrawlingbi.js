import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";

var $ = require('jquery');

class WebCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         toReturn: ""
      };

      this.testWebCrawling = this.testWebCrawling.bind(this);
   }

   //retrieve web crawl results
   testWebCrawling(event){
      $.getJSON(window.location.origin + "/weathercrawlingbi/", (data) => {
         var toReturn = "";
         $.each(data, function(key, val) {
            toReturn = val;
         });  

         this.setState({
            toReturn: toReturn
         });                        
      });
   }

   //rendering the html for web crawling
   render() {
      return (
      <div>
         Note: Please be patient, web crawling takes some time
         <br />
         <button id="submitbutton" class="button" type="submit" onClick={this.testWebCrawling} style={{"vertical-align":"middle", "width":"220px"}}><span>Web Crawl!</span></button>    
         <br />
         <font color="green">{this.state.toReturn}</font>  
      </div>
      );
   }
}
export default WebCrawlingbi;