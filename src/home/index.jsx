import Render from './../render.jsx';
import React, { Component } from 'react';
import { Header } from './../general.jsx';
import axios from 'axios';
import './waifuhome.css';

class BaseElement extends Component {
  constructor(props) {
	   super(props);

     this.state = {};
  }

  componentDidMount() {
    axios.get('/waifu/api/users/@me')
    .then((res) => {
      this.setState({user: res.data});
    })
    .catch((err) => {
      console.log(err);
    });

    axios.get('/waifu/api/users/@me/guilds')
    .then((res) => {
      this.setState({guilds: res.data});
    })
    .catch((err) => {
      console.log(err);
    });
  }

	render() {
		document.title = "Waifu Bot";
    if (this.state.user !== undefined) {
      return (
  			<div className="App">
    			 <Header title="Waifu Bot" user={this.state.user} />
           {this.state.guilds ? (
    		      <Dashboard user={this.state.user} guilds={this.state.guilds} />
           ) : (
             <div className="App-body"></div>
           )}
  			</div>
  		);
    } else {
      return (
  			<div className="App">
    			<Header title="Waifu Bot" />
          <div className="App-body"></div>
  			</div>
      );
    }
	}
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="App-body">
        <p>
          {"Welcome "+this.props.user.username}
        </p>
        <div className="Discord-guilds-list">
          {this.props.guilds.map((guild, i) => {
            return <GuildImage guild={guild} key={i} />
          })}
        </div>
        <div className="Discord-Guild-Add">
          <a href="https://discordapp.com/oauth2/authorize?&client_id=259932651417370624&scope=bot&permissions=66321471" target="_blank">
            <p>Add Waifu to a Server</p>
          </a>
        </div>
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
      <div className="Discord-guild" title={this.props.guild.name}>
        <a href={`/waifu/guilds/${this.props.guild.id}`}>
          {this.props.guild.icon !== null && this.props.guild.icon !== undefined && this.props.guild.icon !== "" ? (
            <img src={`https://cdn.discordapp.com/icons/${this.props.guild.id}/${this.props.guild.icon}.png`} />
          ) : (
            <img src="https://discordapp.com/assets/1c8a54f25d101bdc607cec7228247a9a.svg" />
          )}
        </a>
      </div>
    );
  }
}

Render(BaseElement);
