import Render from './../render.jsx';
import React, { Component } from 'react';
import { Header, Loading, RedirectButton } from './../general.jsx';
import axios from 'axios';
import './waifuguild.css';

class Waifu extends Component {
  constructor(props) {
	   super(props);

     this.state = {
        user: {
          username: ''
        },
        guild: {id: "", permissions: {general: false}}
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
    guildId = guildId[guildId.length-1];

    axios.get('/waifu/api/guilds/'+guildId)
    .then((res) => {
      console.log(res.data);
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
		    <Dashboard guild={this.state.guild} />
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
            <h1>{this.props.guild.name ? this.props.guild.name : "Loading"}</h1>
          </div>
          <div>
            { this.props.guild.permissions.general ? (
              <GuildSettingButton guild={this.props.guild} />
            ) : (
              <div className="Discord-Guild-Image"></div>
            )}
            <GuildImage guild={this.props.guild}/>
          </div>
        </div>
        <div>
          <img src="/assets/images/later.jpg" />
        </div>
      </div>
    );
  }
}

class GuildSettingButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Guild-Settings-Button">
        <a href={"/waifu/guilds/"+this.props.guild.id+"/settings"}>
          <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ3OC43MDMgNDc4LjcwMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDc4LjcwMyA0NzguNzAzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ1NC4yLDE4OS4xMDFsLTMzLjYtNS43Yy0zLjUtMTEuMy04LTIyLjItMTMuNS0zMi42bDE5LjgtMjcuN2M4LjQtMTEuOCw3LjEtMjcuOS0zLjItMzguMWwtMjkuOC0yOS44ICAgIGMtNS42LTUuNi0xMy04LjctMjAuOS04LjdjLTYuMiwwLTEyLjEsMS45LTE3LjEsNS41bC0yNy44LDE5LjhjLTEwLjgtNS43LTIyLjEtMTAuNC0zMy44LTEzLjlsLTUuNi0zMy4yICAgIGMtMi40LTE0LjMtMTQuNy0yNC43LTI5LjItMjQuN2gtNDIuMWMtMTQuNSwwLTI2LjgsMTAuNC0yOS4yLDI0LjdsLTUuOCwzNGMtMTEuMiwzLjUtMjIuMSw4LjEtMzIuNSwxMy43bC0yNy41LTE5LjggICAgYy01LTMuNi0xMS01LjUtMTcuMi01LjVjLTcuOSwwLTE1LjQsMy4xLTIwLjksOC43bC0yOS45LDI5LjhjLTEwLjIsMTAuMi0xMS42LDI2LjMtMy4yLDM4LjFsMjAsMjguMSAgICBjLTUuNSwxMC41LTkuOSwyMS40LTEzLjMsMzIuN2wtMzMuMiw1LjZjLTE0LjMsMi40LTI0LjcsMTQuNy0yNC43LDI5LjJ2NDIuMWMwLDE0LjUsMTAuNCwyNi44LDI0LjcsMjkuMmwzNCw1LjggICAgYzMuNSwxMS4yLDguMSwyMi4xLDEzLjcsMzIuNWwtMTkuNywyNy40Yy04LjQsMTEuOC03LjEsMjcuOSwzLjIsMzguMWwyOS44LDI5LjhjNS42LDUuNiwxMyw4LjcsMjAuOSw4LjdjNi4yLDAsMTIuMS0xLjksMTcuMS01LjUgICAgbDI4LjEtMjBjMTAuMSw1LjMsMjAuNyw5LjYsMzEuNiwxM2w1LjYsMzMuNmMyLjQsMTQuMywxNC43LDI0LjcsMjkuMiwyNC43aDQyLjJjMTQuNSwwLDI2LjgtMTAuNCwyOS4yLTI0LjdsNS43LTMzLjYgICAgYzExLjMtMy41LDIyLjItOCwzMi42LTEzLjVsMjcuNywxOS44YzUsMy42LDExLDUuNSwxNy4yLDUuNWwwLDBjNy45LDAsMTUuMy0zLjEsMjAuOS04LjdsMjkuOC0yOS44YzEwLjItMTAuMiwxMS42LTI2LjMsMy4yLTM4LjEgICAgbC0xOS44LTI3LjhjNS41LTEwLjUsMTAuMS0yMS40LDEzLjUtMzIuNmwzMy42LTUuNmMxNC4zLTIuNCwyNC43LTE0LjcsMjQuNy0yOS4ydi00Mi4xICAgIEM0NzguOSwyMDMuODAxLDQ2OC41LDE5MS41MDEsNDU0LjIsMTg5LjEwMXogTTQ1MS45LDI2MC40MDFjMCwxLjMtMC45LDIuNC0yLjIsMi42bC00Miw3Yy01LjMsMC45LTkuNSw0LjgtMTAuOCw5LjkgICAgYy0zLjgsMTQuNy05LjYsMjguOC0xNy40LDQxLjljLTIuNyw0LjYtMi41LDEwLjMsMC42LDE0LjdsMjQuNywzNC44YzAuNywxLDAuNiwyLjUtMC4zLDMuNGwtMjkuOCwyOS44Yy0wLjcsMC43LTEuNCwwLjgtMS45LDAuOCAgICBjLTAuNiwwLTEuMS0wLjItMS41LTAuNWwtMzQuNy0yNC43Yy00LjMtMy4xLTEwLjEtMy4zLTE0LjctMC42Yy0xMy4xLDcuOC0yNy4yLDEzLjYtNDEuOSwxNy40Yy01LjIsMS4zLTkuMSw1LjYtOS45LDEwLjhsLTcuMSw0MiAgICBjLTAuMiwxLjMtMS4zLDIuMi0yLjYsMi4yaC00Mi4xYy0xLjMsMC0yLjQtMC45LTIuNi0yLjJsLTctNDJjLTAuOS01LjMtNC44LTkuNS05LjktMTAuOGMtMTQuMy0zLjctMjguMS05LjQtNDEtMTYuOCAgICBjLTIuMS0xLjItNC41LTEuOC02LjgtMS44Yy0yLjcsMC01LjUsMC44LTcuOCwyLjVsLTM1LDI0LjljLTAuNSwwLjMtMSwwLjUtMS41LDAuNWMtMC40LDAtMS4yLTAuMS0xLjktMC44bC0yOS44LTI5LjggICAgYy0wLjktMC45LTEtMi4zLTAuMy0zLjRsMjQuNi0zNC41YzMuMS00LjQsMy4zLTEwLjIsMC42LTE0LjhjLTcuOC0xMy0xMy44LTI3LjEtMTcuNi00MS44Yy0xLjQtNS4xLTUuNi05LTEwLjgtOS45bC00Mi4zLTcuMiAgICBjLTEuMy0wLjItMi4yLTEuMy0yLjItMi42di00Mi4xYzAtMS4zLDAuOS0yLjQsMi4yLTIuNmw0MS43LTdjNS4zLTAuOSw5LjYtNC44LDEwLjktMTBjMy43LTE0LjcsOS40LTI4LjksMTcuMS00MiAgICBjMi43LTQuNiwyLjQtMTAuMy0wLjctMTQuNmwtMjQuOS0zNWMtMC43LTEtMC42LTIuNSwwLjMtMy40bDI5LjgtMjkuOGMwLjctMC43LDEuNC0wLjgsMS45LTAuOGMwLjYsMCwxLjEsMC4yLDEuNSwwLjVsMzQuNSwyNC42ICAgIGM0LjQsMy4xLDEwLjIsMy4zLDE0LjgsMC42YzEzLTcuOCwyNy4xLTEzLjgsNDEuOC0xNy42YzUuMS0xLjQsOS01LjYsOS45LTEwLjhsNy4yLTQyLjNjMC4yLTEuMywxLjMtMi4yLDIuNi0yLjJoNDIuMSAgICBjMS4zLDAsMi40LDAuOSwyLjYsMi4ybDcsNDEuN2MwLjksNS4zLDQuOCw5LjYsMTAsMTAuOWMxNS4xLDMuOCwyOS41LDkuNyw0Mi45LDE3LjZjNC42LDIuNywxMC4zLDIuNSwxNC43LTAuNmwzNC41LTI0LjggICAgYzAuNS0wLjMsMS0wLjUsMS41LTAuNWMwLjQsMCwxLjIsMC4xLDEuOSwwLjhsMjkuOCwyOS44YzAuOSwwLjksMSwyLjMsMC4zLDMuNGwtMjQuNywzNC43Yy0zLjEsNC4zLTMuMywxMC4xLTAuNiwxNC43ICAgIGM3LjgsMTMuMSwxMy42LDI3LjIsMTcuNCw0MS45YzEuMyw1LjIsNS42LDkuMSwxMC44LDkuOWw0Miw3LjFjMS4zLDAuMiwyLjIsMS4zLDIuMiwyLjZ2NDIuMUg0NTEuOXoiIGZpbGw9IiNGRkZGRkYiLz4KCQk8cGF0aCBkPSJNMjM5LjQsMTM2LjAwMWMtNTcsMC0xMDMuMyw0Ni4zLTEwMy4zLDEwMy4zczQ2LjMsMTAzLjMsMTAzLjMsMTAzLjNzMTAzLjMtNDYuMywxMDMuMy0xMDMuM1MyOTYuNCwxMzYuMDAxLDIzOS40LDEzNi4wMDEgICAgeiBNMjM5LjQsMzE1LjYwMWMtNDIuMSwwLTc2LjMtMzQuMi03Ni4zLTc2LjNzMzQuMi03Ni4zLDc2LjMtNzYuM3M3Ni4zLDM0LjIsNzYuMyw3Ni4zUzI4MS41LDMxNS42MDEsMjM5LjQsMzE1LjYwMXoiIGZpbGw9IiNGRkZGRkYiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
        </a>
      </div>
    );
  }
}

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
    console.log(this.props.guild);
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
