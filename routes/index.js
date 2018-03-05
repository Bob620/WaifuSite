const express = require('express');

class StandardPages {
	constructor(registry) {
		this.registry = registry;
		this.router = express.Router();

		/* GET landing page. */
		this.router.get('/', (req, res) => {
			res.render('index', { bundle: 'index.js' });
		});

		/* GET home page. */
		this.router.get('/home', (req, res) => {
			if (this.registry.isActiveSession(req.cookies.sessionId)) {
				res.render('index', { bundle: 'home.js' });
			} else {
				res.redirect('/');
			}
		});

		/* GET guild page. */
		this.router.get('/guilds/:guildId', (req, res) => {
			if (this.registry.isActiveSession(req.cookies.sessionId)) {
				res.render('index', { bundle: 'guild.js' });
			} else {
				res.redirect('/');
			}
		});

		/* GET guild moderation page. */
		this.router.get('/guilds/:guildId/settings', (req, res) => {
			if (this.registry.isActiveSession(req.cookies.sessionId)) {
				res.render('index', { bundle: 'guildsettings.js' });
			} else {
				res.redirect('/');
			}
		});

		/* GET add waifu */
		this.router.get('/addwaifu', (req, res) => {
			res.redirect('https://discordapp.com/oauth2/authorize?&client_id=259932651417370624&scope=bot&permissions=66321471');
		});

		/* GET login page. */
		this.router.get('/login', (req, res) => {
			if (this.registry.isActiveSession(req.cookies.sessionId)) {
				res.redirect('/home');
			} else {
				res.redirect('https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Fwaifubot.moe/api/auth&scope=identify guilds&client_id=259932651417370624');
			}
		});

		/* GET logout page. */
		this.router.get('/logout', (req, res) => {
			res.redirect('/api/logout');
		});
	}
}

module.exports = StandardPages;



/* Background Functions */
class WaifuGuild {
  constructor(userGuild, dynamodbItem = {}) {
    const bitPerms = userGuild.owner ? true : userGuild.permissions;

    this.id = userGuild.id;
    this.type = dynamodbItem.type.S ? dynamodbItem.type.S : 'error';
    this.name = userGuild.name;
    this.icon = userGuild.icon;
    this.permissions = Permissions(bitPerms);

    this.welcome = {
      active: dynamodbItem.welcome ? dynamodbItem.welcome.M.active.BOOL : false,
      message: dynamodbItem.welcome ? dynamodbItem.welcome.M.message.S : "Welcome to $guild"
    }
  }

  attributify() {
    return {
      id: {S: this.id},
      type: {S: this.type},
      welcome: {M: {
        active: {BOOL: this.welcome.active},
        message: {S: this.welcome.message}
      }}
    }
  }
}
