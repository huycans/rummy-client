import React, { Component } from 'react';
import { ContextProvider } from "./js/context";
import './App.css';
import "bootstrap/dist/css/bootstrap.css";

import Signin from "./js/components/Signin";
import Signup from './js/components/Signup';
import AuthRoute from "./js/components/AuthRoute";
import Game from "./js/components/Game";
import DefaultRoute from "./js/components/Default";

import { signin, signup, checkSession } from './js/components/API/account';

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
      user: "",
      userToken: "",
      hasGameStarted: false,
      websocket: null,
      isFinishedLoading: false
    };
    this.toggleLoading = this.toggleLoading.bind(this);
    this.signin = this.signin.bind(this);
    this.signup = this.signup.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.setErrorMessage = this.setErrorMessage.bind(this);
    this.startingGame = this.startingGame.bind(this);
    this.validateUsernamePassword = this.validateUsernamePassword.bind(this);

  } 

  async componentDidMount() {
    
    //setup websocket
    let serverWebsocketURL = process.env.WSS || "wss://localhost:3000";
    // this.setState({ websocket: new WebSocket(serverWebsocketURL) });

    try {
      //check if game state still valid
      let localstate = JSON.parse(localStorage.getItem("appState"));
      console.log("localstate", localstate);
      if (localstate) {
        //if local game state exist
        //assume that local game state only exist if the user has signin/signup before
        let isUserTokenValid = await checkSession(localstate.userToken);
        if (isUserTokenValid) {
          this.setState({
            user: localstate.user,
            username: localstate.username,
            userToken: localstate.userToken
          });
        }
        else {
          //token is no longer valid, delete localStorage
          localStorage.clear();
        }

      }
      this.setState({
        isFinishedLoading: true,
        websocket: new WebSocket(serverWebsocketURL)
      });

    } catch (error) {
      console.log(error);
      this.setState({
        isFinishedLoading: true,
        errorMsg: "Cannot check user's token. Please signin again."
      });
    }

  }

  componentWillUnmount() {
    if (this.state.websocket) {
      this.state.websocket.close();
    }
  }

  startingGame() {
    //assume user has signin or signup
    this.setState({
      hasGameStarted: true
    });

  }
  handleInputUsername(event) {
    this.setState({ username: event.target.value });
  }

  handleInputPassword(event) {
    this.setState({ password: event.target.value });
  }
  setErrorMessage(message) {
    // throw Error(message);
    this.setState({ errorMsg: message });
  }

  validateUsernamePassword(){
    const {username, password} = this.state;
    //username length must be between 3 and 50
    if (username.length < 3 || username.length >50 ){
      this.setErrorMessage("Username must be between 3 and 50 characters.")
      return false;
    }
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,20}$/;
    if (!passwordRegex.test(password)){
      this.setErrorMessage("Password must have a minimum of 8 and a maximum of 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&_).");
      return false;
    }
    return true;

  }
  async signin() {
    this.setState({ isLoading: true, errorMsg: "" });
    if (this.validateUsernamePassword()) {
      try {
        //message will be a userToken, save it
        let response = await signin(this.state.username, this.state.password);
        this.setState({
          userToken: response.token,
          user: response.user
        });

        //save user's info
        localStorage.setItem("appState", JSON.stringify({
          username: this.state.username,
          user: this.state.user,
          userToken: this.state.userToken,
        }));


      } catch (error) {
        this.setErrorMessage(error.message);
      } finally {
        this.setState({ isLoading: false });
      }
    }
    else {
      this.setErrorMessage("Username or password is invalid. Please try again.");
    }
  }

  async signup() {
    this.setState({ isLoading: true, errorMsg: "" });
    if (this.validateUsernamePassword()){
      try {
        //message will be a userToken, save it
        let response = await signup(this.state.username, this.state.password);

        this.setState({
          userToken: response.token,
          user: response.user,
        });

        //save user's info
        localStorage.setItem("appState", JSON.stringify({
          username: this.state.username,
          user: this.state.user,
          userToken: this.state.userToken,
        }));

      } catch (error) {
        this.setErrorMessage(error.message);
      } finally {
        this.setState({ isLoading: false });
      }
    }
    else {
      this.setErrorMessage("Username or password is invalid. Please try again.");
    }
  }

  toggleLoading() {
    //toggle the spinning icon 
  }
  render() {
    const { errorMsg, username, password, user, userToken, hasGameStarted, websocket, isFinishedLoading } = this.state;
    const isSignedIn = user !== null && userToken !== "";
    return (
      <BrowserRouter>
        <ContextProvider value={this.state}>
          <div className="App">
            {
              isFinishedLoading ?
                <div>
                  <div className="error-message">
                    {errorMsg ? errorMsg : null}

                  </div>
                  <Switch>
                    <AuthRoute isSignedIn={isSignedIn} type="guest" path="/signup">
                      <Signup signup={this.signup} handleInputUsername={this.handleInputUsername}
                        handleInputPassword={this.handleInputPassword}
                        username={username} password={password} />
                    </AuthRoute>

                    {websocket != null ?
                      <AuthRoute isSignedIn={isSignedIn} type="private" path="/game">
                        <Game hasGameStarted={hasGameStarted}
                          startingGame={this.startingGame}
                          setErrorMessage={this.setErrorMessage}
                          websocket={websocket}
                          userToken={userToken}
                        />
                      </AuthRoute>
                      : null
                    }

                    <AuthRoute isSignedIn={isSignedIn} type="guest" path="/" exact>
                      <Signin signin={this.signin} handleInputUsername={this.handleInputUsername}
                        handleInputPassword={this.handleInputPassword}
                        username={username} password={password} />
                    </AuthRoute>

                    <DefaultRoute/>
                  </Switch>
                </div>
                : <p>Is Loading</p>
            }

          </div>
        </ContextProvider>
      </BrowserRouter>
    );
  }

}
export default App;
