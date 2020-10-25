import React from "react";
import { Redirect, Route } from "react-router";

//HOC to redirect user to game if authenticated, to signin if not
const AuthRoute = props => {
  const { isSignedIn, type } = props;
  if (type === "guest" && isSignedIn) return <Redirect to="/game" />;
  else if (type === "private" && !isSignedIn) return <Redirect to="/" />;

  return <Route {...props} >
  </Route>;
};

export default AuthRoute;