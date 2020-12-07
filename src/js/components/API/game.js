import { SERVER_URL, SERVER_API } from '../../constants';

async function requestJoin(code, userToken) {
  try {
    let response = await fetch(SERVER_URL + SERVER_API.JOIN + "/" + encodeURIComponent(code) , {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken
      }
    });
    let responseJSON = await response.json();

    if (response.status !== 200) {
      throw responseJSON.message;
    } 

    return responseJSON;
  }
  catch (error) {
    throw error;
  }
}

export { requestJoin }