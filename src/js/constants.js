const SERVER_URL = process.env.SERVER_URL || "https://localhost:3000";

const SERVER_API = {
  SIGNIN: "/user/signin",
  SIGNUP: "/user/signup",
  SIGNOUT: "/signout",
  TOKENCHECK: "/user/checkJWTToken",
  JOIN: "/join"
}

export { SERVER_URL, SERVER_API}