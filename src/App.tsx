import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[];
  showGraph: boolean;  // Add showGraph property to state
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  private intervalId: NodeJS.Timeout | null = null; // Track interval ID

  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
      showGraph: false // Initialize showGraph to false
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    if (this.state.showGraph) {
      return <Graph data={this.state.data} />;
    }
    return null; // Return null if showGraph is false
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear previous interval if it exists
    }

    // Fetch data continuously
    this.intervalId = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        this.setState(prevState => {
          // Aggregate duplicates
          const newData = [...prevState.data, ...serverResponds];
          const uniqueData = newData.reduce((acc: ServerRespond[], curr: ServerRespond) => {
            const exists = acc.some(item => item.timestamp === curr.timestamp && item.stock === curr.stock);
            if (exists) {
              return acc.map(item => 
                item.timestamp === curr.timestamp && item.stock === curr.stock
                  ? { ...item, top_ask_price: (item.top_ask_price + curr.top_ask_price) / 2 }
                  : item
              );
            } else {
              return [...acc, curr];
            }
          }, []);
          return { data: uniqueData };
        });
      });
    }, 1000); // Adjust interval as needed
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            onClick={() => { 
              this.setState({ showGraph: true }, () => this.getDataFromServer());
            }}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
