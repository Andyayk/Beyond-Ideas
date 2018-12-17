import React, { Component } from "react";
import ReactDOM from "react-dom";
import Plot from 'react-plotly.js';

var $ = require('jquery');

class App extends Component {
   render() {
      return (
         <div>
            <Plot
               data={[
                  {
                     x: [1, 2, 3, 2, 5, 9, 3, 2],
                     y: [2, 6, 3, 1, 4, 6, 1, 3],
                     type: 'scatter',
                     mode: 'markers',
                     marker: {color: 'red'}
                  }
               ]}
               layout={ {width: 600, height: 500, title: 'A Fancy Plot'} }
            />
         </div>
      );
   }
}
export default App;