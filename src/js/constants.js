let FIXED_SERVER_URL = "", FIXED_WS_URL="";
if (process.env.NODE_ENV == 'production') {
  FIXED_SERVER_URL = "https://rummy-cardgame.herokuapp.com/";
  FIXED_WS_URL = "ws://rummy-cardgame.herokuapp.com";
}
const SERVER_URL = process.env.SERVER_URL || FIXED_SERVER_URL || "http://localhost:3000";
const WS = process.env.WSS || FIXED_WS_URL || "ws://localhost:3000";

const SERVER_API = {
  SIGNIN: "/user/signin",
  SIGNUP: "/user/signup",
  SIGNOUT: "/signout",
  TOKENCHECK: "/user/checkJWTToken",
  JOIN: "/join"
}

export { SERVER_URL, SERVER_API, WS}