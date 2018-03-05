const express = require('express'),
			Requests = require('../util/discordrequests.js');

const requests = new Requests('https://waifubot.moe');

class APIPages {
	constructor(registry) {
		this.registry = registry;
		this.router = express.Router();

		/* User API */
		this.router.get('/users/:userId', (req, res) => {
			const sessionId = req.cookies.sessionId;

			if (this.registry.isActiveSession(sessionId)) {
				res.status(202);
				switch(req.params.userId) {
					case '@me':
						// Send user info (archived getUser)
						requests.requestUser(this.registry.activeSessions.get(sessionId)).then((user) => {
							res.status(200).json(user);
						}).catch(() => {
							res.status(403).end();
						});
						//res.status(403).json(err);
						break;
					default:
						// Implement Further User Calls
						res.status(501).end();
						break;
				}
			} else {
				res.status(403).end();
			}
		});

		// Limited to only personal guilds for security
		this.router.get('/users/@me/guilds', (req, res) => {
			const sessionId = req.cookies.sessionId;

			if (this.registry.isActiveSession(sessionId)) {
				res.status(202);
				// archived getBotGuilds -> archived getGuilds -> Cross reference and send the guilds waifu is in to the user
				requests.requestUserGuilds(this.registry.activeSessions.get(sessionId)).then((guilds) => {
					res.status(200).json(guilds);
				}).catch(() => {
					res.status(403).end();
				});
			} else {
				res.status(403).end();
			}
		});


		/* Guild API */
		this.router.get('/guilds/:guildId', (req, res) => {
			const sessionId = req.cookies.sessionId;
			const guildId = req.params.guildId.toString();

			if (this.registry.isActiveSession(sessionId) && guildId !== undefined) {
				res.status(202);
				// archived getGuilds -> dynamo call to get the guild -> return guild info
				res.status(503).end();
			} else {
				res.status(403).end();
			}
		});


		/* Authentication API */
		this.router.get('/auth', async (req, res) => {
			res.status(202);
			try {
				// Authenticate
				const {sessionId, expires} = await this.registry.createSession(req.query.code);

				res.cookie('sessionId', sessionId, {
					httpOnly: true,
					path: '/',
					expires: expires,
					maxAge: expires
				});

				res.redirect(303, '/home');
			} catch(err) {
				console.log(err);
				res.redirect('/error/401');
			}
		});

		/* logout page. */
		this.router.get('/logout', (req, res) => {
			const sessionId = req.cookies.sessionId;

			if (this.registry.isActiveSession(sessionId)) {
				this.registry.removeSession(sessionId);
				res.clearCookie(sessionId);
				res.redirect('/');
			} else {
				res.clearCookie(sessionId);
				res.redirect('/');
			}
		});
	}
}

module.exports = APIPages;