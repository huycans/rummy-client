import React from 'react';
import { ContextConsumer } from '../context';
import {
  Link
} from "react-router-dom";

const Signup = ({ handleInputUsername, handleInputPassword, username, password, signup }) => {
  const signingUp = (e) => {
    e.preventDefault();
    signup();
  }
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
                  <label htmlFor="username">
                    Username: &nbsp;
                    <input minLength={3} maxLength={50} type="text" name="username" value={username}
                      onChange={handleInputUsername} />
                  </label>
                  <br />
                </div>

                <div className="row w-100">
                  <label htmlFor="username">
                    Password: &nbsp;
                  <input minLength={8} maxLength={20} type="password" name="password" value={password}
                      onChange={handleInputPassword} />
                  </label>
                  <br />
                </div>

                <div className="row">
                  <input type="submit" value="Signup" onClick={signingUp}/>
                </div>
              </form>
              <div style={{ marginTop: "20px" }} className="row">
                <p>
                  Username must be between 3 and 50 characters, contains only alphanumerics or special characters (@._).
              </p>
                <p>
                  Password must be between 8 and 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&_).
              </p>
              </div>
            </div>
            <div>
              <br />
              <br />
              <h4>Already have an account?</h4>
              <Link to="/">Click here</Link>
            </div>
          </div>
        }
      </ContextConsumer>
      )
}
export default Signup;
