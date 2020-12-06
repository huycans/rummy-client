import React, { Component } from 'react';
import { ContextConsumer } from '../context';
import {
  Link
} from "react-router-dom";
import { makeHistory } from "./helper";
import { checkSession } from "./API/account";


export default class Stats extends Component {
  async componentDidMount(){
    let userInfo = await checkSession(this.props.userToken);
    this.props.updateUserInfo(userInfo);
  }

  render() {
    let { user } = this.props;
    let history = [];
    for (let i = 0; i < user.gameHistory.length; i++) {
      history.push(JSON.parse(user.gameHistory[i]));
    }
    return (
      <ContextConsumer>
        {value =>
          <div className="container">
            <div className="row">
              <div>
                <h2>Hello {user.username}</h2>
                <h6>You have played {user.gamePlayed} games</h6>
                <h6>You have won {user.gameWon} games</h6>
                <h6>You have lost {user.gameLost} games</h6>
                <h6>{user.gameDraw} games ended in a draw</h6>
                <br />
              </div>
            </div>
            <div className="row">
              <Link to="/game">Back to game</Link>
            </div>
            <br />
            <h4>Your previous game histories</h4>
            <div className="row">
              {history.map((game, ind) => {
                return <div key={ind} className="col">
                  {makeHistory(game)};
              </div>;
              })}

            </div>
          </div>
        }
      </ContextConsumer>
    );
  }
}