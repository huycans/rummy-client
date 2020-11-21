import React, { Component, useRef } from "react";
// import Deck from './Cards/lib/deck';
import Cards from './lib/card.js/cards';
import $ from 'jquery';

import { requestJoin } from "../components/API/game";

export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMelding: false, //(pick 3 cards to meld)
      isLayingoff: false, //(add 1 card to 1 of the melds)
      isWaiting: false, //(for server command, other player's turn...)
      isDrawing: false, //(from deck or discard pile)
      isDiscarding: false, //(remove 1 card from hand to discard pile),
      hasDrawn: false,
      hasDiscarded: false,
      cards: null,
      tableName: null,
      deck: null,
      lowerhand: null,
      upperhand: null,
      discardPile: null,
      meldPile: null,
      currentMeld: null,
      currentSelectedCardHand: null,
      currentSelectedCardDeck: null,
      currentSelectedCardDiscard: null,
      currentSelectedMeld: null,

    };

    this.handRef = React.createRef();
    this.startGame = this.startGame.bind(this);
    this.handleMeld = this.handleMeld.bind(this);
    this.handleLayoff = this.handleLayoff.bind(this);
    this.cancelMeldOrLayoff = this.cancelMeldOrLayoff.bind(this);
    this.dealing = this.dealing.bind(this);
    this.sortHand = this.sortHand.bind(this);
    this.draw = this.draw.bind(this);
    this.discard = this.discard.bind(this);
    this.setGameState = this.setGameState.bind(this);
    this.setupWebsocket = this.setupWebsocket.bind(this);

    this.websocket = null;
  }

  async setupWebsocket(code="12345678"){
    let websocket= this.websocket;
    let wsServerURL = "wss://localhost:3000" //window.location.href.replace('http', 'ws') + "/" + code;
    websocket = new WebSocket(wsServerURL);

    try {
      //request to join a game
      let response = await requestJoin(code);
      console.log(response);

      //setup websocket events
      websocket.onopen = (event) => {
        console.log("Connected to server.");
      };

      websocket.onmessage = (message) => {
        let data = JSON.parse(message.data);
        console.log("data from server", data);

        //TODO: handle the data

      }
    } catch (error) {
      console.log("An error occurs when trying to join ", error);
    }
  }

  componentWillUnmount(){
    if (this.websocket){
      this.websocket.close();
    }
  }

  discard() {
    let { currentSelectedCardHand, isDiscarding, lowerhand, discardPile } = this.state;
    if (isDiscarding) {
      lowerhand.removeCard(currentSelectedCardHand);
      discardPile.addCard(currentSelectedCardHand);
      discardPile.render();
      lowerhand.render();
      this.setGameState("isWaiting", { hasDiscarded: true, currentSelectedCardHand: null });
      // this.setState({ hasDiscarded: true, currentSelectedCardHand: null });
    }
  }

  setGameState(stateToSet, addtionalStates = {}, callback) {
    this.setState({
      isMelding: stateToSet == "isMelding" ? true : false, //(pick 3 cards to meld)
      isLayingoff: stateToSet == "isLayingoff" ? true : false, //(add 1 card to 1 of the melds)
      isWaiting: stateToSet == "isWaiting" ? true : false, //(for server command, other player's turn...)
      isDrawing: stateToSet == "isDrawing" ? true : false, //(from deck or discard pile)
      isDiscarding: stateToSet == "isDiscarding" ? true : false, //(remove 1 card from hand to discard pile),
      ...addtionalStates
    }, callback);
  }

  draw() {
    let { isDrawing, deck, discardPile, lowerhand, currentSelectedCardDeck, currentSelectedCardDiscard } = this.state;
    let self = this;
    if (isDrawing) {
      if (currentSelectedCardDeck != null) {
        //if draw from deck
        lowerhand.addCard(deck.topCard());
        lowerhand.render();

        self.setGameState("isDiscarding", {
          currentSelectedCardDeck: null,
          currentSelectedCardDiscard: null,
          hasDrawn: true
        });
      } else if (currentSelectedCardDiscard != null) {
        //if draw from discard pile
        lowerhand.addCard(discardPile.topCard());
        lowerhand.render();

        self.setGameState("isDiscarding", {
          currentSelectedCardDeck: null,
          currentSelectedCardDiscard: null,
          hasDrawn: true
        });
      }
    }
  }

  cancelMeldOrLayoff() {
    let { currentMeld, lowerhand, isMelding, isLayingoff } = this.state;
    if (isMelding || isLayingoff) {
      //return all cards from currentMeld to lowerhand
      const length = currentMeld.length;
      for (let i = 0; i < length; i++) {
        let card = currentMeld.pop();
        lowerhand.addCard(card);
        currentMeld.removeCard(card);
        lowerhand.render();
        currentMeld.render();
      }
      this.setGameState("isDiscarding", { currentSelectedCardHand: null });
    }
  }

  sortHand() {
    let { lowerhand } = this.state;
    lowerhand.sort();
    lowerhand.render();
  }

  startGame() {
    //starting an instance of card.js
    var cards = Cards();
    this.props.startingGame();
    const tableName = '#card-table';

    //Tell the library which element to use for the table
    cards.init({ table: tableName });

    //Create a new deck of cards
    var deck = new cards.Deck();
    //By default it's in the middle of the container, put it slightly to the side
    deck.x -= 50;

    //cards.all contains all cards, put them all in the deck
    deck.addCards(cards.all);

    //No animation here, just get the deck onto the table.
    deck.render({ immediate: true });

    //Now lets create a couple of hands, one face down, one face up.
    var lowerhand = new cards.Hand({ faceUp: true, y: 340 });
    var upperhand = new cards.Hand({ faceUp: true, y: 60 });
    // var lefthand = new cards.Hand({ faceUp: true, y: 190, x: 100 });
    // var righthand = new cards.Hand({ faceUp: true, y: 190, x: 500 });
    // var center = new cards.Hand({ faceUp: true, y: 0, x: 0 });

    //Lets add a discard pile
    var discardPile = new cards.Deck({ faceUp: true });
    discardPile.x += 50;

    var meldPile = [];

    //this holds the 3 cards that user want to meld
    //set it to slightly overlap the deck
    var currentMeld = new cards.Hand({ faceUp: true, x: deck.x + 20, y: deck.y + 20 });
    //saving state
    this.setState({
      cards,
      tableName,
      deck,
      lowerhand,
      upperhand,
      discardPile,
      meldPile,
      currentMeld
    });

    //setup click event, these will simply set the clicked card into state and call relevant event handler
    let self = this;
    lowerhand.click(function (card) {
      if (self.state.isMelding) {
        self.setState({ currentSelectedCardHand: card }, () => self.handleMeld());
      }
      if (self.state.isDiscarding) {
        self.setState({ currentSelectedCardHand: card }, () => self.discard());
      }
      if (self.state.isLayingoff) {
        self.setState({ currentSelectedCardHand: card }, () => self.handleLayoff());
      }
    });

    deck.click(function (card) {
      if (self.state.isDrawing)
        self.setState({ currentSelectedCardDeck: card }, () => self.draw());

    });

    discardPile.click(function (card) {
      if (self.state.isDrawing)
        self.setState({ currentSelectedCardDiscard: card }, () => self.draw());
    });

    //setup websocket connection and handle it
    this.setupWebsocket();
    //When you click on the top card of a deck, a card is added
    //to your hand
    // deck.click(function (card) {
    //   if (card === deck.topCard()) {
    //     lowerhand.addCard(deck.topCard());
    //     lowerhand.render();
    //   }
    // });

    //Finally, when you click a card in your hand, if it's
    //the same suit or rank as the top card of the discard pile
    //then it's added to it
    // lowerhand.click(function (card) {
    //   if (card.suit == discardPile.topCard().suit
    //     || card.rank == discardPile.topCard().rank) {
    //     discardPile.addCard(card);
    //     discardPile.render();
    //     lowerhand.render();
    //   }
    // });
  }

  dealing() {
    //this is simply the animation, because the cards dealt is given by the server
    const { discardPile, deck, lowerhand, upperhand } = this.state;
    $('#deal').hide();
    // cards.shuffle(deck);
    // deck.deal(1, [upperhand, lowerhand], 50, function () {
    deck.deal(10, [lowerhand, upperhand], 50, function () {
      //This is a callback function, called when the dealing
      //is done.
      discardPile.addCard(deck.topCard());
      discardPile.render();
    });

    //allow drawing cards
    //also disable meld
    this.setGameState("isDrawing", null, () => this.draw());

  }

  handleLayoff() {
    let { isLayingoff, currentMeld, lowerhand, currentSelectedCardHand, currentSelectedMeld } = this.state;
    if (isLayingoff) {
      //reuse currentMeld to store the laying off card
      //in this usage, currentMeld should have only 1 card
      if (currentMeld.length === 0) {
        //no card yet
        currentMeld.addCard(currentSelectedCardHand);
        lowerhand.removeCard(currentSelectedCardHand);
        currentMeld.sort();
        lowerhand.render();
        currentMeld.render();
      } else if (currentMeld.length === 1) {
        if (currentSelectedMeld != null) {
          let card = currentMeld[0];//the only card inside currentMeld
          //check if layoff card is valid for currentSelectedMeld
          if ((currentSelectedMeld[0].suit === card.suit && currentSelectedMeld[0].rank - 1 === card.rank)
            || (currentSelectedMeld[currentSelectedMeld.length - 1].suit === card.suit && currentSelectedMeld[currentSelectedMeld.length - 1].rank + 1 === card.rank)
          ) {
            //if the card is same suit and less than 1 from the first card in meld, or greater than 1 from the last card in meld
            let cardToLayoff = currentMeld.pop();
            currentSelectedMeld.addCard(cardToLayoff);
            currentMeld.removeCard(cardToLayoff);
            currentSelectedMeld.resize("small");
            currentSelectedMeld.render();
            currentMeld.render();

            this.setState({ currentSelectedCardHand: null, currentSelectedMeld: null }, () => setTimeout(() => this.setGameState("isDiscarding"), 500));//avoid race condition with lowerhand.click event
          }
          else alert("Cannot layoff this card into this meld");

        }
      }
    }
  }

  handleMeld() {

    let validMeld = false;
    let { cards, lowerhand, currentMeld, meldPile } = this.state;
    let card = this.state.currentSelectedCardHand;

    //if there are less then 3 cards, just add them to currentMeld
    if (currentMeld.length < 2) {
      currentMeld.addCard(card);
      lowerhand.removeCard(card);
      currentMeld.sort();
      lowerhand.render();
      currentMeld.render();
    }
    else if (currentMeld.length == 2) {
      //currentMeld has 2 cards already, adding a third will perform a check
      //if check is valid, add cards to the meld pile
      currentMeld.addCard(card);
      lowerhand.removeCard(card);
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
        //move the cards into meld pile, remove them from currentMeld
        let newMeld = new cards.Hand({ faceUp: true, y: 1 });

        const length = currentMeld.length;
        for (let i = 0; i < length; i++) {
          let card = currentMeld.pop();
          newMeld.addCard(card);
          currentMeld.removeCard(card);
        }

        newMeld.x = newMeld.x - 230;
        newMeld.y = newMeld.y + (meldPile.length + 1) * 250 / 5;

        let self = this;
        newMeld.click(function (card) {
          if (self.state.isLayingoff) {
            self.setState({ currentSelectedMeld: newMeld }, () => self.handleLayoff());
          }
        });

        meldPile.push(newMeld);
        newMeld.resize("small");
        newMeld.render();
        currentMeld.render();
        this.setState({ currentSelectedCardHand: null }, () => setTimeout(() => this.setGameState("isDiscarding"), 500));//avoid race condition with lowerhand.click event

      }
      else {
        alert("meld not valid");
      }
      lowerhand.render();
      currentMeld.render();
    }
  }

  componentDidMount() {

  }

  render() {
    const { hasGameStarted } = this.props;
    const { isMelding, hasDiscarded, hasDrawn, isWaiting, isLayingoff } = this.state;
    const disableMeldLayoffButton = () => {
      if (isWaiting) {
        return true;
      } else if (isMelding || isLayingoff) {
        //or melding/layoff is in progress
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
        <button id="start-btn" style={{ display: !hasGameStarted ? "inline" : "none" }}
          onClick={this.startGame}>Start the game</button>
        <div id="card-table">
          <button style={{ display: hasGameStarted ? "block" : "none" }}
            id="deal" onClick={this.dealing}>DEAL</button>

          <button disabled={disableMeldLayoffButton()} style={{ display: hasGameStarted ? "block" : "none" }}
            id="meld"
            onClick={() => this.setGameState("isMelding")}
          >Meld</button>

          <button disabled={disableMeldLayoffButton()} style={{ display: hasGameStarted ? "block" : "none" }}
            id="layoff"
            onClick={() => this.setGameState("isLayingoff")}
          >Layoff</button>

          <button style={{ display: hasGameStarted & (isMelding || isLayingoff) ? "block" : "none" }}
            id="cancel-meld" onClick={this.cancelMeldOrLayoff}
          >Cancel</button>

          <button style={{ display: hasGameStarted ? "block" : "none" }}
            id="sort-hand" onClick={this.sortHand}
          >Sort hand</button>
        </div>

      </div>
    );
  }
}

