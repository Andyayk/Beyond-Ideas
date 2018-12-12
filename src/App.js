import React, { Component } from "react";
import ReactDOM from "react-dom";

class App extends Component {
   constructor() {
      super();
      this.state = {
      };
   }

   
   render() {
      return (
         <div>
            <input placeholder="Enter todo"/>
            <button>Add!</button>
         </div>
      );
   }
}
export default App;

ReactDOM.render(<App />, document.getElementById('app'));