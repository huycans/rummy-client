import {SERVER_URL, SERVER_API} from '../../constants';

async function getServerMessage() {
  try {
    let response = await fetch("https://localhost:3000/welcome", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    console.log(response);
    let responseJSON = await response.json();
    console.log(responseJSON)
    return responseJSON;
} 
catch (error) {
    throw error;
  }
}

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

export { signin, signup }