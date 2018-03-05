import Render from './../render.jsx';
import React, { Component } from 'react';
import { Header, Loading, RedirectButton } from './../general.jsx';
import './waifu.css';
import axios from "axios/index";

class Waifu extends Component {
  constructor() {
  	super();

	  this.state = {};
  }

	componentDidMount() {
		axios.get('/api/users/@me')
		.then((res) => {
			this.setState({user: res.data});
		})
		.catch((err) => {
			console.log(err);
		});
	}

	render() {
		document.title = "Waifu Bot";
		return (
			<div className="App">
			  <Header title="" user={this.state.user}/>
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
            <RedirectButton text="Add Waifu to a Server" link="/addwaifu" />
            <br/>
            <RedirectButton text="Login to Console" link="/login" />
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
