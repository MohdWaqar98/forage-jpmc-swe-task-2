import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  private table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    // Check if the data props is updated and if it's different from the previous props
    if (this.table && prevProps.data !== this.props.data) {
      // Aggregate duplicates
      const aggregatedData = this.props.data.reduce((acc: any[], curr: any) => {
        const index = acc.findIndex((item: any) => item.timestamp === curr.timestamp && item.stock === curr.stock);
        if (index === -1) {
          acc.push({
            stock: curr.stock,
            top_ask_price: curr.top_ask?.price || 0,
            top_bid_price: curr.top_bid?.price || 0,
            timestamp: curr.timestamp,
          });
        } else {
          acc[index].top_ask_price = (acc[index].top_ask_price + (curr.top_ask?.price || 0)) / 2;
          acc[index].top_bid_price = (acc[index].top_bid_price + (curr.top_bid?.price || 0)) / 2;
        }
        return acc;
      }, []);

      // Update the table with the aggregated data
      this.table.update(aggregatedData);
    }
  }
}

export default Graph;
