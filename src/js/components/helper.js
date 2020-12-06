import React from 'react';

const giveCardValue = (card) => {
  let rank = 0;
  switch (card.rank) {
    case 11:
      rank = "J";
      break;
    case 12:
      rank = "Q";
      break;
    case 13:
      rank = "K";
      break;
    default:
      rank = card.rank;
      break;
  }
  return "" + rank + card.suit.toUpperCase();
};

const makeHistory = (history) => {
  return history.map((move, ind) => {
    if (move.cmd == "draw") {
      return <div key={ind}>Player {move.player} draws {giveCardValue(move.card)} from {move.from} <br /></div>;
    }
    else if (move.cmd == "discard") {
      return <div key={ind}>Player {move.player} discards {giveCardValue(move.card)}<br /></div>;
    }
    else if (move.cmd == "newmeld") {
      return <div key={ind}>Player {move.player} melds {move.meld.map((card) => giveCardValue(card) + " ")}<br /></div>;
    }
    else if (move.cmd == "addmeld") {
      return <div key={ind}>Player {move.player} adds {giveCardValue(move.card)} to make meld {move.meld.map((card) => giveCardValue(card) + " ")}<br /></div>;
    }
    else if (move.cmd == "win" || move.cmd == "loss") {
      return <div key={ind}>Player {move.player} won with {move.score} points<br /></div>;
    }
    else if (move.cmd == "gamedraw") {
      return <div key={ind}>The game ended in a draw.<br /></div>;
    }
  });
};

export { giveCardValue, makeHistory}