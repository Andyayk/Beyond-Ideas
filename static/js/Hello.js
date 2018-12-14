import React, { Component } from "react";
import ReactDOM from "react-dom";

var $ = require('jquery');

class Hello extends Component {
   constructor(props) {
      super(props);

      this.state = {greeting: 'Hello ' + this.props.name};
      // This binding is necessary to make 'this'
      // work in the button callback
      this.getPythonHello = this.getPythonHello.bind(this);
   }

   getPythonHello() {
      $.getJSON(window.location.href + 'hello', (data) => {
         var value = '';
         $.each( data, function( key, val ) {
            value = val;
         });  
         this.personaliseGreeting(value);           
      });
   }  

   personaliseGreeting(greeting) {
      this.setState({greeting: greeting + ' ' + this.props.name + '!'});
   }   

   render() {
      return (
         <div>
            <h1>{this.state.greeting}</h1>
            <button type="button" onClick={this.getPythonHello}>Say Hello!</button>
         </div>
      );
   }
}
export default Hello;