async function requestJoin(code, userToken) {
  try {
    let response = await fetch("https://localhost:3000/join/" + code, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + userToken
      }
    });

    if (response.status != 200) {
      throw responseJSON.message;
    } 

    let responseJSON = await response.json();


    return responseJSON;
  }
  catch (error) {
    throw error;
  }
}

export { requestJoin }