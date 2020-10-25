import React, { Component } from 'react';
import { ContextConsumer } from '../context';
import {
  Link
} from "react-router-dom";
const Signin = ({ handleInputUsername, handleInputPassword, username, password, signin }) => {
  const signingIn = (e) => {
    e.preventDefault();
    signin();
  }
  return (
    <ContextConsumer>
      {value =>
        <div className="container">
          <div className="row">
            <h1>Welcome to Rummy</h1>
          </div>
          <div className="row">
            <h2>Signin</h2>
          </div>
          <div className="row">
            <form>
              <div className="row w-100">
                <label htmlFor="username">
                  Username: &nbsp;
                    <input  maxLength={50} type="text" name="username" value={username}
                    onChange={handleInputUsername} />
                </label>
                <br />
              </div>

              <div className="row w-100">
                <label htmlFor="username">
                  Password: &nbsp;
                  <input  maxLength={50} type="password" name="password" value={password}
                    onChange={handleInputPassword} />
                </label>
                <br />
              </div>

              <div className="row">
                <input type="submit" value="Signin" onClick={signingIn} />
              </div>
            </form>
          </div>
          <div>
            <br />
            <br />
            <h4>Don't have an account yet?</h4>
            <Link to="/signup">Click here</Link>
          </div>
        </div>
      }
    </ContextConsumer>
  );
};
export default Signin;