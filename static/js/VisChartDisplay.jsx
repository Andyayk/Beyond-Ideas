import React from "react";

export default class VisChartDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="vis-display-chart vis-card-grid">
        <div className="vis-card-title">
          {this.props.chart} ({this.props.dataset})
        </div>
      </div>
    );
  }
}
