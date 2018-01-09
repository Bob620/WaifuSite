import Render from './../render.jsx';
import React, { Component } from 'react';
import { Header, Loading, RedirectButton } from './../general.jsx';
import axios from 'axios';
import './waifusettings.css';
/*
class State {
  constructor(reactComponent, initialState) {
    initialState.forEach((value, key) => {
      this[key] = value;
    });
  }

  set(firstLevelState, secondLevelState = undefined) {
    if (secondLevelState === undefined) {
      for (let (key, value) of firstLevelState) {
        this[key] = value;
      }
    } else {
      for (let (key, value) of secondLevelState) {
        this[firstLevelState][key] = value;
      }
    }
    reactComponent.setState(this);
  }
}
*/
class Waifu extends Component {
  constructor(props) {
	   super(props);

     this.state = {
        update: this.update.bind(this),
        updateValue: this.updateValue.bind(this),
        user: {
          username: ''
        },
        guild: {id: "", welcome: {active: true, message: "Welcome to $guild"}, permissions: {general: false}, name: ""}
     }
  }

  update(newState) {
    this.setState({guild: newState});

    axios.post('/waifu/api/guilds/'+this.state.guild.id, object)
    .then((res) => {
      this.setState({guild: res.data});
    })
    .catch((err) => {
      console.log(err);
    });
  }

  updateValue(type, rawObject) {
    switch(type) {
      case "messageWelcome":
        let newGuild = this.state.guild
        newGuild.welcome.message = rawObject;
        this.setState({guild: newGuild});
        break;
    }
  }

  componentDidMount() {
    axios.get('/waifu/api/users/@me')
    .then((res) => {
      this.setState({user: res.data});
    })
    .catch((err) => {
      console.log(err);
    });

    var guildId = location.pathname.split('/');
    guildId = guildId[guildId.length-2];

    axios.get('/waifu/api/guilds/'+guildId)
    .then((res) => {
      this.setState({guild: res.data});
    })
    .catch((err) => {
      console.log(err);
    });
  }

	render() {
		document.title = "Waifu Bot";
		return (
			<div className="App">
			  <Header title="Waifu Bot" user={this.state.user} />
		    <Dashboard user={this.state.user} guild={this.state.guild} update={this.state.update} updateValue={this.state.updateValue} />
			</div>
		);
	}
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="App-body">
        <div className="Guild-Bar">
          <div>
            <ReturnButton url="/waifu" />
          </div>
          <div className="Guild-Title" >
            <h1>{this.props.guild.name !== "" ? this.props.guild.name+" Settings" : "Loading"}</h1>
          </div>
          <div>
            <div className="Discord-Guild-Image"></div>
            <GuildImage guild={this.props.guild}/>
          </div>
        </div>
        <div className="Guild-Body">
          {this.props.guild.id !== "" &&
            <GuildSettings guild={this.props.guild} update={this.props.update} />
          }
        </div>
      </div>
    );
  }
}

class GuildSettings extends Component {
  constructor(props) {
    super(props);

    this.state = props.guild;
    this.state.changed = false;

    this.push = this.push.bind(this);
    this.update = this.update.bind(this);
    this.change = this.change.bind(this);
  }

  push(e) {
    this.setState({changed: false});

    console.log(this.state);

    axios.post('/waifu/api/guilds/'+this.state.id, this.state)
    .then((res) => {
      this.setState(res.data);
      console.log(res.data);
    })
    .catch((err) => {
      this.setState({changed: true});
      console.log(err);
    });
    e.preventDefault();
  }

  update() {
    this.props.update(this.state);
  }

  change(type, subType, value) {
    this.setState({changed: true});
    this.setState((prevState, props) => {
      prevState[type][subType] = value
      return {[type]: prevState[type]};
    });
  }

  render() {
    return (
      <div id="Guild-Settings">
        <form className="General-Guild-Settings" onSubmit={this.push}>
          <div className="Guild-Setting">
            <h3>Welcome Message</h3>
            <ToggleSetting change={this.change} value={this.state.welcome.active} type={"welcome"} />
            <MessageSetting change={this.change} value={this.state.welcome.message} type={"welcome"} active={this.state.welcome.active} />
            <p>&newUser - Adds a refrence to the user in that location. &newUser -> @Bob620</p>
            <p>&serverName - Shortcut to provide the server's name incase you like to change it up a lot</p>
          </div>
        </form>
        <div onClick={this.push} className={this.state.changed ? "Save-Button on" : "Save-Button"}><div>
          <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgNjEyIDYxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyIDYxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJfeDMyX18xM18iPgoJCTxnPgoJCQk8cGF0aCBkPSJNMzYzLjM3NSwxOTEuMjVjMTAuNTU3LDAsMTkuMTI1LTguNTY4LDE5LjEyNS0xOS4xMjV2LTc2LjVjMC0xMC41NTctOC41NjgtMTkuMTI1LTE5LjEyNS0xOS4xMjUgICAgIHMtMTkuMTI1LDguNTY4LTE5LjEyNSwxOS4xMjV2NzYuNUMzNDQuMjUsMTgyLjY4MiwzNTIuODE4LDE5MS4yNSwzNjMuMzc1LDE5MS4yNXogTTUzNS41LDBoLTQ1OUMzNC4yNTMsMCwwLDM0LjI1MywwLDc2LjV2NDU5ICAgICBDMCw1NzcuNzQ3LDM0LjI1Myw2MTIsNzYuNSw2MTJoNDU5YzQyLjI0NywwLDc2LjUtMzQuMjUzLDc2LjUtNzYuNXYtNDU5QzYxMiwzNC4yNTMsNTc3Ljc0NywwLDUzNS41LDB6IE0xNTMsMzguMjVoMzA2djE3Mi4xMjUgICAgIGMwLDEwLjU1Ny04LjU2OCwxOS4xMjUtMTkuMTI1LDE5LjEyNWgtMjY3Ljc1Yy0xMC41NTcsMC0xOS4xMjUtOC41NjgtMTkuMTI1LTE5LjEyNVYzOC4yNXogTTU3My43NSw1MzUuNSAgICAgYzAsMjEuMTMzLTE3LjExNywzOC4yNS0zOC4yNSwzOC4yNWgtNDU5Yy0yMS4xMzMsMC0zOC4yNS0xNy4xMTctMzguMjUtMzguMjV2LTQ1OWMwLTIxLjEzMywxNy4xMTctMzguMjUsMzguMjUtMzguMjVoMzguMjUgICAgIFYyMjkuNWMwLDIxLjExNCwxNy4xMTcsMzguMjUsMzguMjUsMzguMjVoMzA2YzIxLjEzMywwLDM4LjI1LTE3LjEzNiwzOC4yNS0zOC4yNVYzOC4yNWgzOC4yNWMyMS4xMzMsMCwzOC4yNSwxNy4xMzYsMzguMjUsMzguMjUgICAgIFY1MzUuNXoiIGZpbGw9IiNGRkZGRkYiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
        </div></div>
      </div>
    );
  }
}

class ToggleSetting extends Component {
  constructor(props) {
    super(props);

    this.change = this.change.bind(this);
  }

  change() {
    this.props.change(this.props.type, "active", !this.props.value);
  }

  render() {
    return (
      <div className={this.props.value ? "Toggle active" : "Toggle"} onClick={this.change} >
        <div><div></div></div>
      </div>
    );
  }
}

class MessageSetting extends Component {
  constructor(props) {
    super(props);

    this.change = this.change.bind(this);
  }

  change(e) {
    const message = e.target.value;
    if (this.props.active && message.length < 400) {
      this.props.change(this.props.type, "message", message);
    }
  }

  render() {
    if (this.props.active) {
      return (<input className="MessageInput" type="text" value={this.props.value} onChange={this.change} />);
    }
    return (<input className="MessageInput deactivate" readOnly type="text" value={this.props.value} onChange={this.change} />);
  }
}
//<div className={this.state.changed ? "Status on" : "Status"}></div>

class ReturnButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Return-Button">
        <a href={this.props.url}>
          <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDMxLjQ5NCAzMS40OTQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMxLjQ5NCAzMS40OTQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNjRweCIgaGVpZ2h0PSI2NHB4Ij4KPHBhdGggZD0iTTEwLjI3Myw1LjAwOWMwLjQ0NC0wLjQ0NCwxLjE0My0wLjQ0NCwxLjU4NywwYzAuNDI5LDAuNDI5LDAuNDI5LDEuMTQzLDAsMS41NzFsLTguMDQ3LDguMDQ3aDI2LjU1NCAgYzAuNjE5LDAsMS4xMjcsMC40OTIsMS4xMjcsMS4xMTFjMCwwLjYxOS0wLjUwOCwxLjEyNy0xLjEyNywxLjEyN0gzLjgxM2w4LjA0Nyw4LjAzMmMwLjQyOSwwLjQ0NCwwLjQyOSwxLjE1OSwwLDEuNTg3ICBjLTAuNDQ0LDAuNDQ0LTEuMTQzLDAuNDQ0LTEuNTg3LDBsLTkuOTUyLTkuOTUyYy0wLjQyOS0wLjQyOS0wLjQyOS0xLjE0MywwLTEuNTcxTDEwLjI3Myw1LjAwOXoiIGZpbGw9IiNGRkZGRkYiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
        </a>
      </div>
    );
  }
}

class GuildImage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div className="Discord-Guild-Image" title={this.props.guild.name}>
      <a href={`/waifu/guilds/${this.props.guild.id}`}>
        {this.props.guild.icon !== null && this.props.guild.icon !== undefined && this.props.guild.icon !== "" ? (
          <img src={`https://cdn.discordapp.com/icons/${this.props.guild.id}/${this.props.guild.icon}.png`} />
        ) : (
          <img src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg" />
        )}
      </a>
    </div>
  )}
}

Render(Waifu);
