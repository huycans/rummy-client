import { getServerMessage} from './API/index'
import React, { Component } from 'react'

export default class Welcome extends Component {
  state = {
    msg: ""
  }

  componentDidMount(){
    getServerMessage().then(
      (mesg) => {
        this.setState({ msg: mesg.msg })
      }
    )
  }

  render() {
    return (
      <div>
        Welcome to rummy client
        <div>
          the server said: {this.state.msg}
        </div>
      </div>
    )
  }
}

