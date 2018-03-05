import React, { Component } from 'react';
import './general.css';

const loadingIcon = '/assets/images/loading.png';
const logo = '/assets/images/logo-white.png';
const waifuLogo = '/assets/images/waifu.jpg'

class Header extends Component {
  render() {
    return (
      <section className="App-header">
        <div className="App-tabs">
          <a href="http://bobco.moe">
            <img src={logo} className="App-logo" alt="BobCo" />
          </a>
          <a href="/">
            <img src={waifuLogo} className="SubApp-logo" alt="Waifu" />
          </a>
          <a href="https://www.patreon.com/bob620"><img src="/assets/images/patreonButton.png" className="Patreon-top-button" /></a>
        </div>
        {this.props.user ? (
          <div className="App-User">
              <div>
                <p>{this.props.user.username}</p>
              </div>
              {this.props.user.avatar !== null && this.props.user.avatar !== undefined && this.props.user.avatar !== "" ? (
                <img src={"https://cdn.discordapp.com/avatars/"+this.props.user.id+"/"+this.props.user.avatar+".png"} />
              ):(
                <img src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg" />
              )}
              <a href="/logout">
                <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ3MS4yIDQ3MS4yIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzEuMiA0NzEuMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMjcuNjE5LDQ0NC4yaC0xMjIuOWMtMzMuNCwwLTYwLjUtMjcuMi02MC41LTYwLjVWODcuNWMwLTMzLjQsMjcuMi02MC41LDYwLjUtNjAuNWgxMjQuOWM3LjUsMCwxMy41LTYsMTMuNS0xMy41ICAgIHMtNi0xMy41LTEzLjUtMTMuNWgtMTI0LjljLTQ4LjMsMC04Ny41LDM5LjMtODcuNSw4Ny41djI5Ni4yYzAsNDguMywzOS4zLDg3LjUsODcuNSw4Ny41aDEyMi45YzcuNSwwLDEzLjUtNiwxMy41LTEzLjUgICAgUzIzNS4wMTksNDQ0LjIsMjI3LjYxOSw0NDQuMnoiIGZpbGw9IiNGRkZGRkYiLz4KCQk8cGF0aCBkPSJNNDUwLjAxOSwyMjYuMWwtODUuOC04NS44Yy01LjMtNS4zLTEzLjgtNS4zLTE5LjEsMGMtNS4zLDUuMy01LjMsMTMuOCwwLDE5LjFsNjIuOCw2Mi44aC0yNzMuOWMtNy41LDAtMTMuNSw2LTEzLjUsMTMuNSAgICBzNiwxMy41LDEzLjUsMTMuNWgyNzMuOWwtNjIuOCw2Mi44Yy01LjMsNS4zLTUuMywxMy44LDAsMTkuMWMyLjYsMi42LDYuMSw0LDkuNSw0czYuOS0xLjMsOS41LTRsODUuOC04NS44ICAgIEM0NTUuMzE5LDIzOS45LDQ1NS4zMTksMjMxLjMsNDUwLjAxOSwyMjYuMXoiIGZpbGw9IiNGRkZGRkYiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
              </a>
          </div>
        ):(
          <div className="App-User">
          </div>
        )}
      </section>
    );
  }
}

class Button extends Component {
  render() {
    return (
      <button className="App-button" type={this.props.type ? this.props.type : "text"} onClick={this.props.onClick ? this.props.onClick : ""}>
        <p>{this.props.text}</p>
      </button>
    );
  }
}

class RedirectButton extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    window.location.assign(this.props.link);
  }

  render() {
    return (
      <button className="App-button" type={this.props.type} onClick={this.onClick}>
        <p>{this.props.text}</p>
      </button>
    );
  }
}

class Loading extends Component {
  render() {
    return (
      <div className="App-loading">
        <img src={loadingIcon} alt="loading" />
      </div>
    );
  }
}

export { Header, Button, Loading, RedirectButton};
