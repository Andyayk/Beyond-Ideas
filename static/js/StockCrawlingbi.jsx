import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import "../css/main";
import sharePriceIcon from "../images/SharePriceIcon.png";
import arrowicon from "../images/arrow.png";

var $ = require('jquery');

class StockCrawlingbi extends Component {  
   constructor() {
      super();
      this.state = {
         message: "",
         stockname: "",
         filename: "",        
         save: "",
         errordatestatement: "",
         hideLoadingBar: true,         
      };
    
      this.enablesubmitbutton = this.enablesubmitbutton.bind(this);

      this.selectStockName = this.selectStockName.bind(this);  
      this.selectFilename = this.selectFilename.bind(this);                
      this.switchToDatabase = this.switchToDatabase.bind(this);
      this.switchToCSV = this.switchToCSV.bind(this);    
      this.stockCrawler = this.stockCrawler.bind(this);

      this.formSubmitted = this.formSubmitted.bind(this);  

      this.loadingBarInstance = (
         <div className="loader"></div>                                   
      );    
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
   


   //store the stock that the user has selected
   selectStockName(event) {
      this.setState({
         stockname: event.target.value
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
      const re = /[0-9a-fA-F_]+/g;
      if (!re.test(e.key)) {
         e.preventDefault();
      }
   }

   //retrieve web crawl results
   stockCrawler(event){
      var stock = this.state.stockname;
      var saveToDB = this.state.save;
      var filename = this.state.filename;
      $.post(window.location.origin + "/stockcrawlingbi/",
      {
         stockname: stock,
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
      this.stockCrawler();
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
                                 <td colspan="3" style={{"width":"100%", "height":"150px", "paddingTop":"15px"}} valign="top" align="center">
                                    <img src={sharePriceIcon} width="150" height="150" />
                                 </td>
                              </tr>
                              <br/>
                              <tr>
                                 <td style={{"width":"48%", "height":"250px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>
                                       <div className="cardtitle">
                                          1. Select Stock
                                       </div>                                  
                                    </tr><tr>                             
                                       <div className="cardsubtitle">
                                          Stock:
                                       </div>
                                    </tr><tr>
                                       <select required defaultValue="" onChange={this.selectStockName} style={{"width":"220px"}}>
                                          <option value="" disabled>-------- select a stock --------</option>
                                          <option value="ETR:DPW">Deutsche Post AG</option>
                                          <option value="FDX">FedEx Corporation</option>
                                          <option value="UPS">United Parcel Service, Inc.</option>                     
                                       </select>
                                    </tr>
                                 </td>
                                 <td style={{"width":"2%", "height":"250px"}} valign="center" align="center">
                                    <img src={arrowicon} width="45" height="45" />
                                 </td>                                   
                                 <td style={{"width":"48%", "height":"250px", "paddingTop":"15px", "paddingBottom":"15px", "boxShadow":"0 4px 8px 0 rgba(0,0,0,0.2)", "borderRadius":"12px"}} valign="top" align="center" bgcolor="white">
                                    <tr>   
                                       <div className="cardtitle">
                                          2. Enter Dataset Name
                                       </div>
                                    </tr><tr>
                                       <div className="cardsubtitle">
                                          e.g. "dhl_shareprice"
                                       </div>
                                    </tr><tr>
                                       <td align="center">
                                          <input required type="text" id="filename" onKeyPress={(e) => this.validation(e)}
                                          style={{"width":"220px"}} onChange={this.selectFilename}/>
                                       </td>
                                    </tr>
                                    <tr>
                                       <td align="center">
                                          <button onClick={this.switchToDatabase} id="submitbutton" className="button" type="submit" style={{"verticalAlign":"middle", "width":"220px"}}>Retrieve Share Prices</button>    
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
export default StockCrawlingbi;