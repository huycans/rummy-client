import React, { Component } from 'react';
import { ContextProvider } from "./js/context";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";

import Signin from "./js/components/Signin";
import Signup from './js/components/Signup';
import AuthRoute from "./js/components/AuthRoute";
import Game from "./js/components/Game";

import { signin, signup } from './js/components/API/account';

import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "Hello from context store",
      errorMsg: "",
      username: "",
      password: "",
      // token: "",
      // user: null//the user info object
      user: "sss",
      token: "sss",
      hasGameStarted: false,
      websocket: new WebSocket("wss://localhost:3000")
    };
    this.toggleLoading = this.toggleLoading.bind(this);
    this.signin = this.signin.bind(this);
    this.signup = this.signup.bind(this);
    this.validate = this.validate.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.setErrorMessage = this.setErrorMessage.bind(this);
    this.startingGame = this.startingGame.bind(this);

  }

  componentWillUnmount() {
    if (this.state.websocket) {
      this.state.websocket.close();
    }
  }

  startingGame(){
    this.setState({
      hasGameStarted: true
    })
  }
  handleInputUsername(event) {
    this.setState({ username: event.target.value });
  }

  handleInputPassword(event) {
    this.setState({ password: event.target.value });
  }
  setErrorMessage(message) {
    this.setState({ errorMsg: message });
  }

  async signin() {
    this.setState({ isLoading: true, errorMsg: "" });
    try {
      if (!this.validate()) {
        this.setErrorMessage("Username or password is invalid. Please try again.");
        return;
      }

      //message will probably be a token, save it
      let response = await signin(this.state.username, this.state.password);
      this.setState({
        token: response.token,
        user: response.user
      });

    } catch (error) {
      this.setErrorMessage(error.message);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async signup() {
    this.setState({ isLoading: true, errorMsg: "" });
    try {
      if (!this.validate()) {
        this.setErrorMessage("Username or password is invalid. Please try again.");
        return;
      }

      //message will probably be a token, save it
      let response = await signup(this.state.username, this.state.password);
      this.setState({
        token: response.token,
        user: response.user
      });

    } catch (error) {
      this.setErrorMessage(error.message);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  validate() {
    const { username, password } = this.state;

    //validate, if valid, send to server
    if (username.length > 50 || password.length > 50) {
      return false; //alert("Email or password is invalid. Please try again.");
    }
    else return true;
  }


  toggleLoading() {
    //toggle the spinning icon 
  }
  render() {
    const { errorMsg, username, password, user, token, hasGameStarted, websocket } = this.state;
    const isSignedIn = user !== null && token !== "";
    return (
      <BrowserRouter>
        <ContextProvider value={this.state}>
          <div className="App">
            <div className="error-message">
              {errorMsg ? errorMsg : null}

            </div>
            <Switch>
              <AuthRoute isSignedIn={isSignedIn} type="guest" path="/signup">
                <Signup signup={this.signup} handleInputUsername={this.handleInputUsername}
                  handleInputPassword={this.handleInputPassword}
                  username={username} password={password}/>
              </AuthRoute>
              
              <AuthRoute isSignedIn={isSignedIn} type="private" path="/game">
                <Game hasGameStarted={hasGameStarted} 
                  startingGame={this.startingGame} 
                  setErrorMessage={this.setErrorMessage}
                  websocket={websocket}
                  />
              </AuthRoute>

              <AuthRoute isSignedIn={isSignedIn} type="guest" path="/">
                <Signin signin={this.signin} handleInputUsername={this.handleInputUsername}
                  handleInputPassword={this.handleInputPassword}
                  username={username} password={password}/>
              </AuthRoute>

              
            </Switch>
          </div>
        </ContextProvider>
      </BrowserRouter>
    );
  }

}
export default App;
