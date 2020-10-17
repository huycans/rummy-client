import React, { Component } from 'react';
import { ContextConsumer } from '../context';
import {
  Link
} from "react-router-dom";

export default class Signup extends Component {
  render() {
    return (
      <ContextConsumer>
        {value =>
          <div className="container">
            <div className="row">
              <h1>Welcome to Rummy</h1>
            </div>
            <div className="row">
              <h2>Signup</h2>
            </div>
            <div className="row">
              <form>
                <div className="row w-100">
                  <label for="username">
                    Username: &nbsp;
                    <input maxLength={50} type="text" name="username" />
                  </label>
                  <br />
                </div>

                <div className="row w-100">
                  <label for="username">
                    Password: &nbsp;
                  <input maxLength={50} type="password" name="password" />
                  </label>
                  <br />
                </div>

                <div className="row">
                  <input type="submit" value="Login" />
                </div>
              </form>
            </div>
            <div>
              <br />
              <br />
              <h4>Already have an account?</h4>
              <Link to="/signin">Click here</Link>
            </div>
          </div>
        }
      </ContextConsumer>
    );
  }
}
