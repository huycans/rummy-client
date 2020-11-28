

//handle what happens when a cmd is received from the server
//this refers to game.js
//split up to avoid 1000s of lines of code
function gameHandler(message){
  let data = JSON.parse(message.data);
  console.log("data from server", data);

  //initial setup with deck, discardPile and my hand
  if (data.cmd === "cards") {
    //setstate deck, discardPile, hand, op's hand
    this.dealing(data);
  } else if (data.cmd == "draw") {
    this.draw(data);
  } else if (data.cmd == "discard") {
    this.discard(data);
  } else if (data.cmd == "newmeld") {
    this.moveMeldToPile(data)
  } else if (data.cmd == "addmeld") {
    this.moveCardToMeld(data);
  } else if (data.cmd == "win" || data.cmd == "loss") {
    this.declareWinner(data)
  } else if (data.cmd == "exit") {
    this.props.setErrorMessage("Lobby is full. Please choose another lobby code. ")
  } else if (data.cmd == "ping") {

  }
}

export default gameHandler;