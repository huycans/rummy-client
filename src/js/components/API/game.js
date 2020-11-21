async function requestJoin(code) {
  try {
    let response = await fetch("https://localhost:3000/join/" + code, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    // console.log(response);
    let responseJSON = await response.json();
    // console.log(responseJSON);
    return responseJSON;
  }
  catch (error) {
    throw error;
  }
}

export { requestJoin }