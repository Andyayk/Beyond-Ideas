import React from "react";
import VisChartSidebarSelection from "./VisChartSidebarSelection";
import VisChartSidebarButton from "./VisChartSidebarButton";
import VisChartSidebarFilter from "./VisChartSidebarFilter";
import VisChartSidebarTopKToggle from "./VisChartSidebarTopKToggle";

export default class VisChartSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterChildren: []
    };
    this.appendFilter = this.appendFilter.bind(this);
  }

  appendFilter() {
    this.props.addFilterObject();
    this.setState((prevState, props) => ({
      filterChildren: [
        ...prevState.filterChildren,
        <VisChartSidebarFilter
          columns={this.props.headers}
          //   updateSelectedFilter={this.props.updateSelectedFilter}
          updateSpecificFilterObject={this.props.updateSpecificFilterObject}
          key={prevState.filterChildren.length}
          filterIndex={prevState.filterChildren.length}
          //   filterValueSelection={this.props.filterValueSelection}
          uniqueValues={this.props.uniqueValues}
        />
      ]
    }));
  }

  removeAllFilters() {
    this.setState({ filterChildren: [] });
    this.props.removeFilterObjects();
  }

  render() {
    return (
      <div className="vis-display-sidebar vis-card-grid-config">
        <div className="vis-card-title">CONFIGURATION</div>
        <div>
          <VisChartSidebarSelection
            selectionTitle="X-Axis: "
            dropdownValues={this.props.headers}
            update={this.props.updateSelectedXAxis}
          />
          <VisChartSidebarSelection
            selectionTitle="Y-Axis: "
            dropdownValues={this.props.headers}
            update={this.props.updateSelectedYAxis}
          />
          <VisChartSidebarSelection
            selectionTitle="Aggregate Method: "
            dropdownValues={["SUM", "AVG", "COUNT"]}
            update={this.props.updateSelectedAggregate}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <VisChartSidebarTopKToggle
            topKTog={this.props.topKTog}
            plotlyType={this.props.plotlyType}
            toggleTopK={this.props.toggleTopK}
            updateTopKSort={this.props.updateTopKSort}
            updateTopKLimit={this.props.updateTopKLimit}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <button
              onClick={() => this.appendFilter()}
              style={{ margin: "25px", textAlign: "center" }}
            >
              Add Filter Condition
            </button>
            <button
              onClick={() => this.removeAllFilters()}
              style={{ margin: "25px", textAlign: "center" }}
            >
              Remove All Filters
            </button>
          </div>
          {this.state.filterChildren.map(filterChild => filterChild)}
        </div>
        <VisChartSidebarButton onClick={this.props.runQuery} />
      </div>
    );
  }
}
