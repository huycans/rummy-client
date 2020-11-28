import React, { Component, useRef } from "react";
// import Deck from './Cards/lib/deck';
import Cards from './lib/card.js/cards';
import $ from 'jquery';

import { requestJoin } from "../components/API/game";
import gameHandler from "./GameHandler";

export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMelding: false, //(pick 3 cards to meld)
      isAddingToMeld: false, //(add 1 card to 1 of the melds)
      isWaiting: false, //(for server command, other player's turn...)
      isDrawing: false, //(from deck or discard pile)
      isDiscarding: false, //(remove 1 card from hand to discard pile),
      hasDrawn: false,
      hasDiscarded: false,
      cards: null,
      tableName: null,
      deck: null,
      myhand: null,
      ophand: null,
      discardPile: null,
      meldPile: null,
      currentMeld: null,
      currentSelectedCardHand: null,
      currentSelectedCardDeck: null,
      currentSelectedCardDiscard: null,
      currentSelectedMeld: null,
      //the game code to distinguish games, called lobby in server
      code: "",
      //randomly generated token from the server
      token: "",
      hint: ""
    };

    this.handRef = React.createRef();
    this.startGame = this.startGame.bind(this);
    this.handleMeld = this.handleMeld.bind(this);
    this.handleAddToMeld = this.handleAddToMeld.bind(this);
    this.cancelMeldOrAddToMeld = this.cancelMeldOrAddToMeld.bind(this);
    this.dealing = this.dealing.bind(this);
    this.sortHand = this.sortHand.bind(this);
    this.draw = this.draw.bind(this);
    this.discard = this.discard.bind(this);
    this.setGameState = this.setGameState.bind(this);
    this.joinGameWithCode = this.joinGameWithCode.bind(this);
    this.sendWSData = this.sendWSData.bind(this);
    this.gameHandler = gameHandler.bind(this);
    this.moveMeldToPile = this.moveMeldToPile.bind(this);
    this.setHint = this.setHint.bind(this);
  }

  setHint(message) {
    this.setState({ hint: message });
  }

  componentDidMount() {
    let { websocket } = this.props;
    //setup websocket events
    websocket.onopen = (event) => {
      console.log("Connected to server.");
    };

    //starting an instance of card.js
    var cards = Cards();
    const tableName = '#card-table';

    //Tell the library which element to use for the table
    cards.init({ table: tableName });
    this.setState({ cards, tableName });

    websocket.onmessage = (message) => {
      this.gameHandler(message);
    };

    window.addEventListener('beforeunload', () => { // Attempts to Close Socket before forced disconnect
      if (websocket) websocket.close();
    });
  }

  //used to send data to the server, as string
  sendWSData(data) {
    let { websocket, userToken } = this.props;
    // console.log("WEBSOCKET", websocket);
    const { code, token } = this.state;
    //always includes token and game code when sending data
    data.lobby = code;
    data.token = token;
    data.userToken = userToken;
    // Send Data (as string)
    websocket.send(JSON.stringify(data));
  }

  //setup websocket connection to the server
  async joinGameWithCode(code = "12345678979", userToken) {
    try {

      //request to join a game with code typed in by user
      let joinResponse = await requestJoin(code, userToken);

      let token = joinResponse.token;
      console.log(token);

      this.setState({
        code, token
      });

      //send request to join a game
      this.sendWSData({ cmd: "join" });

    } catch (error) {
      console.log("An error occurs when trying to join: ", error);
      this.props.setErrorMessage("An error occurs when trying to join " + error);
    }
  }

  discard(data) {
    let { currentSelectedCardHand, isDiscarding, myhand, discardPile, ophand, deck } = this.state;
    let self = this;
    let cardToDiscard = data.card;

    //if i am discarding the card
    if (data.player == "me") {

      discardPile.addCard(myhand.find((cardVal) => cardVal.suit == cardToDiscard.suit && cardVal.rank == cardToDiscard.rank));
      myhand.removeCard(myhand.find((cardVal) => cardVal.suit == cardToDiscard.suit && cardVal.rank == cardToDiscard.rank));

      this.setGameState("isWaiting", { hasDiscarded: true, currentSelectedCardHand: null });
    }
    else {
      //the opponent is discarding a card
      //remove the top fake card from ophand, then add the card to discard from deck to ophand
      $(ophand.topCard().el).hide()
      ophand.removeCard(ophand.topCard());
      ophand.addCard(deck.find((cardVal) => cardVal.suit == cardToDiscard.suit && cardVal.rank == cardToDiscard.rank));

      ophand.render({ immediate: true });
      deck.render({ immediate: true });
      //then place the card from ophand into discard pile
      discardPile.addCard(ophand.topCard());

      //since the opponent is discarding, it is my turn
      this.setGameState("isDrawing", { hasDiscarded: false, hasDrawn: false });
    }
    ophand.sort();
    myhand.render();
    ophand.render();
    discardPile.render();
    deck.render();
  }

  setGameState(stateToSet, addtionalStates = {}, callback) {
    let hint = "";
    switch (stateToSet) {
      case "isMelding":
        hint = "Please choose 3 cards that have the same rank but different suit, or same suit but in sequence.";
        break;
      case "isAddingToMeld":
        hint = "Please choose a card, then click on a preexisiting meld that you want to lay off to.";
        break;
      case "isWaiting":
        hint = "Waiting for other player move.";
        break;
      case "isDrawing":
        hint = "Please draw a card from the deck or the discard pile.";
        break;
      case "isDiscarding":
        hint = "Please choose a card from your hand to discard or you can create a meld.";
        break;
      default:
        break;
    }
    this.setState({
      isMelding: stateToSet == "isMelding" ? true : false, //(pick 3 cards to meld)
      isAddingToMeld: stateToSet == "isAddingToMeld" ? true : false, //(add 1 card to 1 of the melds)
      isWaiting: stateToSet == "isWaiting" ? true : false, //(for server command, other player's turn...)
      isDrawing: stateToSet == "isDrawing" ? true : false, //(from deck or discard pile)
      isDiscarding: stateToSet == "isDiscarding" ? true : false, //(remove 1 card from hand to discard pile),
      hint,
      ...addtionalStates
    }, callback);
  }

  draw(data) {
    let { isDrawing, deck, discardPile, myhand, currentSelectedCardDeck, currentSelectedCardDiscard, ophand, cards } = this.state;
    let self = this;
    //if i am drawing the card
    // if (isDrawing && data.player == "me") { isDrawing is not needed anymore since the server will dictate when and where to draw
    if (data.player == "me") {
      let cardToDraw = data.card;
      if (data.from == "deck") {
        //if draw from deck
        myhand.addCard(deck.find((cardVal) => cardVal.suit == cardToDraw.suit && cardVal.rank == cardToDraw.rank));

        self.setGameState("isDiscarding", {
          currentSelectedCardDeck: null,
          currentSelectedCardDiscard: null,
          hasDrawn: true
        });
      } else {
        //if draw from discard pile
        myhand.addCard(discardPile.topCard());

        self.setGameState("isDiscarding", {
          currentSelectedCardDeck: null,
          currentSelectedCardDiscard: null,
          hasDrawn: true
        });
      }
      deck.render();
      myhand.render();
      ophand.render();
      discardPile.render();
    }
    else {
      //the opponent is drawing a card
      if (data.from == "deck") {
        //if draw from deck
        deck.addCard(cards.getFakeCards());
        deck.render({ immediate: true });
        ophand.addCard(deck.topCard());
        deck.render();
        myhand.render();
        ophand.render();
        discardPile.render();
      } else {
        //if draw from discard pile
        ophand.addCard(discardPile.topCard());
        ophand.render();
        discardPile.render();
        //do this to make sure ophand contains only fake cards
        deck.addCard(ophand.topCard());
        ophand.addCard(cards.getFakeCards());
        //invisible render
        ophand.render({ immediate: true });
        deck.render({ immediate: true });
      }
    }
  }

  cancelMeldOrAddToMeld() {
    let { currentMeld, myhand, isMelding, isAddingToMeld } = this.state;
    if (isMelding || isAddingToMeld) {
      //return all cards from currentMeld to myhand
      const length = currentMeld.length;
      for (let i = 0; i < length; i++) {
        let card = currentMeld.pop();
        myhand.addCard(card);
        currentMeld.removeCard(card);
        myhand.render();
        currentMeld.render();
      }
      this.setGameState("isDiscarding", { currentSelectedCardHand: null });
    }
  }

  sortHand() {
    let { myhand } = this.state;
    myhand.sort();
    myhand.render();
  }

  startGame(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.startingGame();

    console.log("Starting game");
    let { cards } = this.state;

    //Create a new deck of cards
    var deck = new cards.Deck();
    //By default it's in the middle of the container, put it slightly to the side
    deck.x -= 50;

    //adding all cards to the deck
    deck.addCards(cards.all);

    //No animation here, just get the deck onto the table.
    deck.render({ immediate: true });

    //Now lets create a couple of hands, one face down, one face up.
    var myhand = new cards.Hand({ faceUp: true, y: 340 });
    var ophand = new cards.Hand({ faceUp: true, y: 60 });

    //Lets add a discard pile
    var discardPile = new cards.Deck({ faceUp: true });
    discardPile.x += 50;

    var meldPile = [];

    //this holds the 3 cards that user want to meld
    //set it to slightly overlap the deck
    var currentMeld = new cards.Hand({ faceUp: true, x: deck.x + 20, y: deck.y + 20 });

    //setup click event, these will simply set the clicked card into state and call relevant event handler
    let self = this;
    myhand.click(function (card) {
      if (self.state.isMelding) {
        self.setState({ currentSelectedCardHand: card }, () => self.handleMeld());
      }
      if (self.state.isDiscarding) {
        self.setState({ currentSelectedCardHand: card }, () => {
          self.sendWSData({
            cmd: "discard",
            suit: card.suit,
            rank: card.rank
          });
        });
      }
      if (self.state.isAddingToMeld) {
        self.setState({ currentSelectedCardHand: card }, () => self.handleAddToMeld());
      }
    });

    deck.click(function (card) {
      if (self.state.isDrawing)
        self.setState({ currentSelectedCardDeck: card }, () => {
          self.sendWSData({
            cmd: "draw",
            from: "deck"
          });

          //this should be called when receiving command
          // self.draw();
        });

    });

    discardPile.click(function (card) {
      if (self.state.isDrawing)
        self.setState({ currentSelectedCardDiscard: card }, () => {
          self.sendWSData({
            cmd: "draw",
            from: "discardPile",
            rank: card.rank,
            suit: card.suit
          });
        });
    });

    //saving state
    this.setState({
      cards,
      deck,
      myhand,
      ophand,
      discardPile,
      meldPile,
      currentMeld
    });

    //setup websocket connection and handle it
    this.joinGameWithCode("12131313", this.props.userToken);

  }

  //setup the initial layout of the table
  dealing(data) {
    //data is from the server
    //this is simply the animation, because the cards dealt is given by the server
    const { cards, discardPile, deck, myhand, ophand, meldPile } = this.state;
    $('#deal').hide();

    //adding cards that is in player's hand
    for (let card of data.cards) {
      let cardToAdd = cards.all.find(
        (cardVal, cardInd) => {
          return cardVal.suit == card.suit && cardVal.rank == card.rank;
        }
      );
      myhand.addCard(cardToAdd);
    }

    //adding cards in the discard pile
    for (let card of data.discardPile) {
      discardPile.addCard(cards.all.find((cardVal, cardInd) => cardVal.suit == card.suit && cardVal.rank == card.rank));
    }

    //fill ophand with fake cards
    for (let i = 0; i < data.opcards; i++) {
      ophand.addCard(cards.getFakeCards());
    }

    //adding melds
    for (let meld of data.melds) {
      //adding the cards in the current meld 
      let meldArr = [];
      for (let card of meld) {
        let cardToAdd = cards.all.find(
          (cardVal, cardInd) => {
            return cardVal.suit == card.suit && cardVal.rank == card.rank;
          });
        meldArr.push(cardToAdd);
      }

      let newMeld = new cards.Hand({ faceUp: true, y: 1 });

      const length = meldArr.length;
      for (let i = 0; i < length; i++) {
        let card = meldArr.pop();
        newMeld.addCard(card);
      }
      newMeld.sort();
      newMeld.x = newMeld.x - 230;
      newMeld.y = newMeld.y + (meldPile.length + 1) * 250 / 5;

      let self = this;
      newMeld.click(function (card) {
        if (self.state.isAddingToMeld) {
          self.setState({ currentSelectedMeld: newMeld }, () => self.handleAddToMeld());
        }
      });

      meldPile.push(newMeld);
      newMeld.resize("small");
      newMeld.render();
    }
    //now, render everything
    deck.render();
    discardPile.render();
    myhand.render();
    ophand.render();

    if (data.myturn) {
      //if it is my turn
      if (data.drawPhase) {
        //drawing stage
        this.setGameState("isDrawing");
      } else {
        this.setGameState("isDiscarding", { hasDrawn: true });
      }
    }
    else {
      this.setGameState("isWaiting");
    }
  }

  //server has accepted the request to add card to meld, now move the card to meld
  moveCardToMeld(data) {
    let cardToMoveToMeld = data.card;
    let { currentMeld, myhand, ophand, deck, meldPile } = this.state;
    //i am doing the adding
    if (data.player == 'me') {
      let { currentSelectedMeld } = this.state;
      //make sure the card that server says to add is the same that the client request to add
      if (cardToMoveToMeld.rank == currentMeld[0].rank && cardToMoveToMeld.suit == currentMeld[0].suit) {
        // let cardToAddToMeld = currentMeld.pop();
        currentSelectedMeld.addCard(currentMeld.topCard());
        // currentMeld.removeCard(cardToAddToMeld);
      } else {
        //for some reason, the client card and server's card is not the same, ignore client card

        this.cancelMeldOrAddToMeld();
        //move cards from myhand to the meld that needs adding

        //the card in local game
        let card = myhand.find((cardVal) => cardVal.rank == cardToMoveToMeld.rank && cardVal.rank == cardToMoveToMeld.rank);
        currentSelectedMeld.addCard(card);
        // myhand.removeCard(card);
      }
      this.setState({ currentSelectedCardHand: null, currentSelectedMeld: null }, () => setTimeout(() => this.setGameState("isDiscarding"), 500));//avoid race condition with myhand.click event
      currentSelectedMeld.sort();
      currentSelectedMeld.resize("small");
      currentSelectedMeld.render();
      currentMeld.render();
      ophand.render();
      myhand.render();
    }
    else {
      //the opponent is doing the adding
      //assume that ophand has only fake cards, any card ophand drew is actually in deck

      //the card in local game
      let card = deck.find((cardVal) => cardVal.suit == cardToMoveToMeld.suit && cardVal.rank == cardToMoveToMeld.rank);

      ophand.removeCard(ophand.topCard());
      ophand.render({ immediate: true });
      
      ophand.addCard(card);
      //avoid rendering
      ophand.render({ immediate: true });
      deck.render({ immediate: true });

      let meldToAdd = meldPile[data.meldId];
      //move cards from ophand to currentSelectedMeld
      meldToAdd.addCard(ophand.topCard());
      // ophand.removeCard(card);

      //render
      meldToAdd.sort();
      meldToAdd.resize("small");
      meldToAdd.render();
      ophand.render();
    }
  }

  //handle add a card to meld on client side, if the card is valid then it is sent to server
  handleAddToMeld() {
    let { isAddingToMeld, currentMeld, myhand, currentSelectedCardHand, currentSelectedMeld } = this.state;
    if (isAddingToMeld) {
      //reuse currentMeld to store the card to add
      //in this usage, currentMeld should have only 1 card
      if (currentMeld.length === 0) {
        //no card yet
        currentMeld.addCard(currentSelectedCardHand);
        myhand.removeCard(currentSelectedCardHand);
        currentMeld.sort();
        myhand.render();
        currentMeld.render();
      } else if (currentMeld.length === 1) {
        if (currentSelectedMeld != null) {
          let card = currentMeld[0];//the only card inside currentMeld
          //check if card to add to meld is valid for currentSelectedMeld
          if ((currentSelectedMeld[0].suit === card.suit && currentSelectedMeld[0].rank - 1 === card.rank)
            || (currentSelectedMeld[currentSelectedMeld.length - 1].suit === card.suit && currentSelectedMeld[currentSelectedMeld.length - 1].rank + 1 === card.rank)
          ) {
            //if the card is same suit and less than 1 from the first card in meld, or greater than 1 from the last card in meld
            this.sendWSData({
              cmd: "addmeld",
              card: {
                suit: card.suit,
                rank: card.rank
              },
              meldId: currentSelectedMeld.id
            });
          }
          else alert("Cannot add this card into this meld");

        }
      }
    }
  }

  //this function handles melding process client side only, it does not move cards into the meld pile
  handleMeld() {
    let validMeld = false;
    let { cards, myhand, currentMeld, meldPile } = this.state;
    let card = this.state.currentSelectedCardHand;

    //if there are less then 3 cards, just add them to currentMeld
    if (currentMeld.length < 2) {
      currentMeld.addCard(card);
      myhand.removeCard(card);
      currentMeld.sort();
      myhand.render();
      currentMeld.render();
    }
    else if (currentMeld.length == 2) {
      //currentMeld has 2 cards already, adding a third will perform a check
      //if check is valid, add cards to the meld pile
      currentMeld.addCard(card);
      myhand.removeCard(card);
      currentMeld.sort();
      //three in a row, same suit
      if (currentMeld[0].suit == currentMeld[1].suit && currentMeld[1].suit == currentMeld[2].suit) {
        if (Math.abs(currentMeld[0].rank - currentMeld[1].rank) == 1
          && Math.abs((currentMeld[1].rank - currentMeld[2].rank)) == 1) {
          validMeld = true;
        }
      }
      else {
        //or three of same rank, diff suit
        if ((currentMeld[0].rank) == currentMeld[1].rank && (currentMeld[1].rank) == currentMeld[2].rank) {
          validMeld = true;
        }
      }
      if (validMeld) {
        //the meld is valid, send a cmd to meld to server
        this.sendWSData({
          cmd: "newmeld",
          player: "me",
          meld: currentMeld.map((card) => {
            return { suit: card.suit, rank: card.rank };
          })//array with 3 cards
        });
      }
      else {
        alert("meld not valid");
      }
      myhand.render();
      currentMeld.render();
    }
  }

  moveMeldToPile(data) {
    let { cards, meldPile, currentMeld, myhand, ophand, deck } = this.state;
    let meldToMove = data.meld; //this is the meld given by server; currentMeld is the local meld
    let newMeld = new cards.Hand({ faceUp: true, y: 1 });

    //i am doing the melding
    if (data.player == 'me') {
      let isCurrentMeldValid = true;
      //make sure the meld that we are moving to the meld pile is the same as the meld the client has chosen
      if (meldToMove.length === currentMeld.length) {
        for (let i = 0; i < meldToMove.length; i++) {
          if (!currentMeld.some((cardVal) => cardVal.rank == meldToMove[i].rank && cardVal.suit == meldToMove[i].suit)) {
            //if a card in meldToMove not exist in currentMeld, then currentMeld is invalid
            isCurrentMeldValid = false;
            break;
          }
        }
      } else {
        isCurrentMeldValid = false;
      }

      //this should not happen, unless something weird happens with the server or the player cheated somehow
      if (!isCurrentMeldValid) {
        //ignore currentMeld and use meldToMove instead
        //cancel the currentMeld
        this.cancelMeldOrAddToMeld();
        //move cards from myhand to the meldPile
        let length = meldToMove.length;
        for (let i = 0; i < length; i++) {
          let card = myhand.pop();
          newMeld.addCard(card);
          currentMeld.removeCard(card);
        }
      } else {
        //the normal, expected flow
        let length = meldToMove.length;
        for (let i = 0; i < length; i++) {
          let card = currentMeld.pop();
          newMeld.addCard(card);
          currentMeld.removeCard(card);
          //add id of the meld to newMeld, this is useful when adding a card to a meld
        }
      }
      this.setState({ currentSelectedCardHand: null }, () => setTimeout(() => this.setGameState("isDiscarding"), 500));//avoid race condition with myhand.click event

    }
    //the other player is doing the melding
    else if (data.player == "op") {
      //assume that ophand has only fake cards, any card ophand drew is actually in deck

      //remove 3 cards from ophand
      for (let i = 0; i < meldToMove.length; i++) {
        $(ophand.topCard().el).hide()
        ophand.removeCard(ophand.topCard());
        ophand.render({ immediate: true });
      }

      //add cards from deck to ophand
      for (let i = 0; i < meldToMove.length; i++) {
        ophand.addCard(deck.find((cardVal) => cardVal.suit == meldToMove[i].suit && cardVal.rank == meldToMove[i].rank));
      }
      //avoid rendering
      ophand.render({ immediate: true });
      deck.render({ immediate: true });

      //move cards from ophand to newMeld
      for (let i = 0; i < meldToMove.length; i++) {
        newMeld.addCard(ophand.topCard());
      }
    }
    //sort the card without rendering
    newMeld.sort();
    newMeld.render({ immediate: true });

    newMeld.x = newMeld.x - 230;
    newMeld.y = newMeld.y + (meldPile.length + 1) * 250 / 5;

    let self = this;
    newMeld.id = data.meldId;
    newMeld.click(function (card) {
      if (self.state.isAddingToMeld) {
        self.setState({ currentSelectedMeld: newMeld }, () => self.handleAddToMeld());
      }
    });

    meldPile.push(newMeld);
    newMeld.resize("small");
    newMeld.render();
    currentMeld.render();
  }

  render() {
    const { hasGameStarted } = this.props;
    const { isMelding, hasDiscarded, hasDrawn, isWaiting, isAddingToMeld, hint } = this.state;
    const disableAddToMeldButton = () => {
      if (isWaiting) {
        return true;
      } else if (isMelding || isAddingToMeld) {
        //or melding/AddToMeld is in progress
        return true;
      }
      else if (hasDrawn && !hasDiscarded) {
        //if user has drawn a card but has not discard a card yet
        return false;
      }
      return true;
    };

    const handref = <div id="hand" ref={this.handRef} />;
    return (
      <div>
        <p>Welcome to the game</p>
        <div id="hint">
          {hint}
        </div>
        <button id="start-btn" style={{ display: !hasGameStarted ? "inline" : "none" }}
          onClick={this.startGame}>Start the game</button>
        <div id="card-table">
          <button disabled={disableAddToMeldButton()} style={{ display: hasGameStarted ? "block" : "none" }}
            id="meld"
            onClick={() => this.setGameState("isMelding")}
          >Meld</button>

          <button disabled={disableAddToMeldButton()} style={{ display: hasGameStarted ? "block" : "none" }}
            id="addtomeld"
            onClick={() => this.setGameState("isAddingToMeld")}
          >Add to meld</button>

          <button style={{ display: hasGameStarted & (isMelding || isAddingToMeld) ? "block" : "none" }}
            id="cancel-meld" onClick={this.cancelMeldOrAddToMeld}
          >Cancel</button>

          <button style={{ display: hasGameStarted ? "block" : "none" }}
            id="sort-hand" onClick={this.sortHand}
          >Sort hand</button>
        </div>

      </div>
    );
  }
}

