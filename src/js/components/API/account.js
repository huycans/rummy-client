import {SERVER_URL, SERVER_API} from '../../constants';

async function signin(username, password){
  try {
    let response = await fetch(SERVER_URL + SERVER_API.SIGNIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    let responseJSON = await response.json();
    if (response.status !== 200 && response.ok === false) {
      throw new Error(responseJSON.err.message);
    } else {
      return responseJSON;
    }
  } catch (error) {
    throw error;
  }
}

async function signup(username, password) {
  try {
    let response = await fetch(SERVER_URL + SERVER_API.SIGNUP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    let responseJSON = await response.json();
    if (response.status != 200 && response.ok == false) {
      throw new Error(responseJSON.err.message);
    } else {
      return responseJSON;
    }
  } catch (error) {
    throw error;
  }
}

async function checkSession(sessionToken) {
  try {
    let response = await fetch(SERVER_URL + SERVER_API.TOKENCHECK, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + sessionToken
      }
    });
    let responseJSON = await response.json();
    if (responseJSON.success == false && responseJSON.status == "JWT invalid") {
      return null;
    } else {
      return responseJSON.user;
    }
  } catch (error) {
    throw error;
  }
}

export { signin, signup, checkSession }