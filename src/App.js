import React, { Component } from 'react';
import { ContextProvider } from "./js/context";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import Signin from "./js/components/Signin";
import Signup from './js/components/Signup';

import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
  state = {
    message: "Hello from context store"
  };
  render() {
    return (
      <BrowserRouter>
        <ContextProvider value={this.state}>
          <div class="App container d-flex h-100">
            <Switch>
            
              <Route path="/signup">
                <Signup />
              </Route>

              <Route path="/">
                <Signin />
              </Route>

            </Switch>
          </div>
        </ContextProvider>
      </BrowserRouter>
    );
  }

}
export default App;
