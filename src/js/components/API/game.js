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