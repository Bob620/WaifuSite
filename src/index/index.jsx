import Render from './../render.jsx';
import React, { Component } from 'react';
import { Header, Loading, RedirectButton } from './../general.jsx';
import './waifu.css';

class Waifu extends Component {
  constructor() {
	   super();
  }

	render() {
		document.title = "Waifu Bot";
		return (
			<div className="App">
			  <Header title=""/>
		    <GeneralHome />
			</div>
		);
	}
}

class GeneralHome extends Component {
  render() {
    return (
      <div className="App-body">
        <section id="left-part">
          <div>
            <div id="waifu-image">
              <img src="/assets/images/waifu.jpg" />
            </div>
            <p className="App-intro">
              An easy to use Chatbot based around anime pictures
            </p>
            <RedirectButton text="Add Waifu to a Server" link="https://discordapp.com/oauth2/authorize?&client_id=259932651417370624&scope=bot&permissions=66321471" />
            <br/>
            <RedirectButton text="Login to Console" link="https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost/waifu/api/auth&scope=identify guilds&client_id=259932651417370624" />
          </div>
        </section>
        <section id="right-part">
          <h1>Waifu</h1>
          <div id="info">
            <div className="taka">
              <img src="/assets/images/taka.png" />
            </div>
            <div className="desc">
              <div>
                <p>Waifu is a discord chatbot who primarily posts anime images. More commands and functions are planned for the future.</p>
                <p>If you would like to request images, a new Waifu/Husbando, or any new or changed functions, please talk with me via Discord.</p>
                <RedirectButton text="Join Waifu Discord Group" link="https://discord.gg/M53CsmK" />
              </div>
            </div>
          </div>
          <div id="skinny-info">
            <div className="taka">
              <p>Waifu is a discord chatbot who primarily posts anime images. More commands and functions are planned for the future.</p>
              <img src="/assets/images/taka.png" />
            </div>
            <div className="desc">
              <div>
                <p>If you would like to request images, a new Waifu/Husbando, or any new or changed functions, please talk with me via Discord.</p>
                <RedirectButton text="Join Waifu Discord Group" link="https://discord.gg/M53CsmK" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

Render(Waifu);
