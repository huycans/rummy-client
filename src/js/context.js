
import React, { Component } from "react";

const AppContext = React.createContext();

/**
 * COntext is used to store the state of the application and pass it down
 * to components, using ContextConsumer
 *
 * @class ContextProvider
 * @extends {Component}
 */
class ContextProvider extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <AppContext.Provider value={{
        ...this.props.value
      }}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
const ContextConsumer = AppContext.Consumer;
export { ContextProvider, ContextConsumer };