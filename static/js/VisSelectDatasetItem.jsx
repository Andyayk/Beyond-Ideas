import React from "react";
import "../css/VisualisationPage";

export default class VisSelectDatasetItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="inputGroup">
        <input
          id={this.props.id}
          name="radio"
          type="radio"
          onChange={() => this.props.selectDatasetHandler(this.props.name)}
        />
        <label htmlFor={this.props.id}>{this.props.name}</label>
      </div>
    );
  }
}
