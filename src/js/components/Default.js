import React, { Component } from 'react';
import { ContextConsumer } from '../context';
import {
  Link
} from "react-router-dom";

const Default = ({ handleInputUsername, handleInputPassword, username, password, signin }) => {

  return (
    <div className="container">
      <div>
        <h1>404 not found</h1>
        <Link to="/">Back to main page</Link>
      </div>
    </div>
  );
};
export default Default;