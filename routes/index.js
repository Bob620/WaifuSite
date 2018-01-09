const express = require('express');
const https = require('https');
const http = require('http');
const FlakeId = require('flake-idgen');
const flakeId = new FlakeId();
const intformat = require('biguint-format')
const kagi = require('kagi');

// Waifu Storage
const aws = require('aws-sdk');
aws.config.update(kagi.getChain('kagi.chn').getLink('credentials'));
const dynamodbWestTwo = new aws.DynamoDB({apiVersion: '2012-08-10', 'region': 'us-west-2'});

// This Web Server
const router = express.Router();
const sessionTokens = {};

setInterval(() => {
  for (let i = 0; i < sessionTokens.length; i++) {
    let expires = sessionTokens[i].expires_in;
    expires -= 1800000;
    if (expires <= 0) {
      delete sessionTokens[i];
    }
  }
}, 1800000);

/* GET Pages */

/* GET landing page. */
router.get('/', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    res.redirect('/home');
  } else {
    res.render('index', { bundle: 'index.js' });
  }
});

/* GET home page. */
router.get('/home', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    res.render('index', { bundle: 'home.js' });
  } else {
    res.redirect('/');
  }
});

/* GET guild page. */
router.get('/guilds/:guildId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    res.render('index', { bundle: 'guild.js' });
  } else {
    res.redirect('/');
  }
});

/* GET guild moderation page. */
router.get('/guilds/:guildId/settings', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    res.render('index', { bundle: 'guildsettings.js' });
  } else {
    res.redirect('/');
  }
});

/* GET logout page. */
router.get('/logout', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    revokeToken(sessionTokens[sessionId])
    .then(() => {
      delete sessionTokens[sessionId];
      res.clearCookie(sessionId);
      res.redirect('/');
    })
    .catch(() => {
      delete sessionTokens[sessionId];
      res.clearCookie(sessionId);
      res.redirect('/');
    })
  } else {
    res.redirect('/');
  }
});

/* GET collector landing page. */
router.get('/collector', (req, res, next) => {
  res.render('index', { bundle: 'collector.js' });
});

/* API calls */

/* User API */
router.get('/api/users/:userId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    if (req.params.userId === '@me') {
      res.status(202);
      getUser(sessionTokens[sessionId])
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(403).json(err);
      });
    } else {
      // Implement Further User Calls
      res.status(403).end();
    }
  } else {
    res.status(403).end();
  }
});

// Limited to only personal guilds for security
router.get('/api/users/@me/guilds', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionTokens[sessionId]) {
    res.status(202);

    getBotGuilds()
    .then((botGuilds) => {
      getGuilds(sessionTokens[sessionId])
      .then((userGuilds) => {
        let guilds = [];
        userGuilds.forEach((guild) => {
          if (botGuilds.includes(guild.id)) {
            guilds.push(guild);
          }
        });

        res.status(200).json(guilds);
      })
      .catch((err) => {
        res.status(403).json(err);
      });
    })
    .catch((err) => {
      res.status(403).json(err);
    });
  } else {
    res.status(403).end();
  }
});

/* Guild API */
router.get('/api/guilds/:guildId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  const guildId = req.params.guildId.toString();

  if (sessionId && sessionTokens[sessionId] && guildId && guildId !== 'undefined') {
    res.status(202);

    getGuilds(sessionTokens[sessionId])
    .then((userGuilds) => {
      let userGuild = userGuilds.filter((guild) => {
        return guild.id === guildId
      });
      userGuild = userGuild[0];

      if (userGuild) {
        dynamodbWestTwo.getItem({TableName:"bobbot", Key: {id: {S: guildId}, type: {S: 'discord'}}}, (err, data) => {
          if (err) {
            console.log(err);
            res.status(404).json({message: "An Error Occured"});
          } else {
            const guild = new WaifuGuild(userGuild, data.Item);

            res.status(200).json(guild);
          }
        });
      } else {
        res.status(403).end();
      }
    })
    .catch((err) => {
      res.status(403).json({message: "An Error Occured"});
    });
  } else {
    res.status(403).end();
  }
});

router.post('/api/guilds/:guildId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  const guildId = req.params.guildId.toString();
  if (sessionId && sessionTokens[sessionId]) {
    res.status(202);

    getGuilds(sessionTokens[sessionId])
    .then((userGuilds) => {
      let userGuild = userGuilds.filter((guild) => {
        return guild.id === guildId
      });
      userGuild = userGuild[0];

      if (userGuild) {
        dynamodbWestTwo.getItem({TableName:"bobbot", Key: {id: {S: guildId}, type: {S: 'discord'}}}, (err, data) => {
          if (err) {
            res.status(404).json({message: "An Error Occured"});
          } else {
            let guild = new WaifuGuild(userGuild, data.Item);

            let entries = Object.entries(req.body);
            if (guild.permissions.general) {
              entries.forEach(([key, value]) => {
                switch (key) {
                  case "welcome":
                    if (typeof value.active === 'boolean') {
                      guild.welcome.active = value.active;
                    }
                    if (value.message && value.message.length > 1 && value.message.length < 400) {
                      guild.welcome.message = value.message;
                    }
                    break;
                }
              });
            }

            dynamodbWestTwo.putItem({TableName:"bobbot", Item: guild.attributify()}, (err, data) => {
              if (err) {
                res.status(500).json({message: "An Error Occured"});
              } else {
                res.status(200).json(guild);
              }
            });
          }
        });
      } else {
        res.status(403).end();
      }
    })
    .catch((err) => {
      res.status(403).json(err);
    });
  } else {
    res.status(403).end();
  }
});

/* Authenitcation API */
router.get('/api/auth', (req, res, next) => {
  // Authenticate
  authenticate(req.query.code)
  .then((info) => {
    sessionId = intformat(flakeId.next(), 'dec');

    sessionTokens[sessionId] = info.token;

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      path: '/waifu',
      expires: new Date(Date.now()+info.expires_in),
      maxAge: info.expires_in
    });

    res.redirect(303, '/waifu');
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/error/401');
  });
});

/* Background Functions */

/**
 * Authenticate a user
 * @returns {Promise} The OAuth2 Token and Expiration
 */
function authenticate(code) {
  return new Promise((resolve, reject) => {
    let info = {};

    const test = https.request({
      path: '/api/oauth2/token?client_id=259932651417370624&client_secret=-V_Rkf4Gg44QraRjjMdbss465gL42vOH&grant_type=authorization_code&redirect_uri=http://localhost/waifu/api/auth&code='+code,
      hostname: 'discordapp.com', method: 'POST', port: '443', headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DiscordBot (https://github.com/Bob620/bobco, 2.1.0)'
      }
    }, (res) => {
      res.setEncoding('utf8');

      res.on('data', (data) => {
        const jsondata = JSON.parse(data);
        if (jsondata.access_token === undefined || jsondata.expires_in === undefined) {
          info.err = {code: 0, message: "unable to authenticate"}
        } else {
          info.token = jsondata.access_token;
          info.expires_in = jsondata.expires_in;
        }
      });

      res.on('end', () => {
        if (info.err) {
          reject(info.err);
        } else {
          resolve(info);
        }
      });
    });
    test.end();
  });
}

/**
 * Retrives waifubot's guilds
 * @returns {Promise} Waifu's Guilds
 */
function getBotGuilds() {
  return new Promise((resolve, reject) => {
    let guilds = '';

    const test = http.request({
      path: '/api/guilds',
      hostname: 'bobco.moe', method: 'GET', port: '3063', headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, (res) => {
      res.setEncoding('utf8');

      res.on('data', (data) => {
        guilds += data;
      });

      res.on('end', () => {
        const guildsjson = JSON.parse(guilds);
        if (guildsjson.code) {
          reject(guildsjson);
        } else {
          resolve(guildsjson);
        }
      })
    });

    test.end();
  });
}

/**
 * Retrive Guild Scope
 * @param {string} token OAuth2 token
 * @returns {Promise} The user's guilds
 */
function getGuilds(token) {
  return new Promise((resolve, reject) => {
    let guilds = '';

    const test = https.request({
      path: '/api/users/@me/guilds',
      hostname: 'discordapp.com', method: 'GET', port: '443', headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DiscordBot (https://github.com/Bob620/bobco, 1.0.0)'
      }
    }, (res) => {
      res.setEncoding('utf8');

      res.on('data', (data) => {
        guilds += data;
      });

      res.on('end', () => {
        const guildsjson = JSON.parse(guilds);
        if (guildsjson.code) {
          reject(guildsjson);
        } else {
          resolve(guildsjson);
        }
      })
    });

    test.end();
  });
}

/**
 * Retrive Identity Scope
 * @param {string} token OAuth2 token
 * @returns {Promise} The User
 */
function getUser(token) {
  return new Promise((resolve, reject) => {
    let identity = '';

    const test = https.request({
      path: '/api/users/@me',
      hostname: 'discordapp.com', method: 'GET', port: '443', headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DiscordBot (https://github.com/Bob620/bobco, 1.0.0)'
      }
    }, (res) => {
      res.setEncoding('utf8');

      res.on('data', (data) => {
        identity += data
      });

      res.on('end', () => {
        const identityjson = JSON.parse(identity);
        if (identityjson.code) {
          reject(identityjson);
        } else {
          resolve(identityjson);
        }
      })
    });

    test.end();
  });
}

function revokeToken(token) {
  return new Promise((resolve, reject) => {
    let info = {};

    const test = https.request({
      path: `/api/oauth2/token/revoke?token=${token}`,
      hostname: 'discordapp.com', method: 'GET', port: '443', headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DiscordBot (https://github.com/Bob620/bobco, 1.0.0)'
      }
    }, (res) => {
      res.setEncoding('utf8');

      res.on('data', (data) => {
        const jsondata = JSON.parse(data);
        if (jsondata.access_token === undefined || jsondata.expires_in === undefined) {
          info.err = {code: 0, message: "unable to authenticate"}
        } else {
          info.token = jsondata.access_token;
          info.expires_in = jsondata.expires_in;
        }
      });

      res.on('end', () => {
        if (info.err) {
          reject(info.err);
        } else {
          resolve(info);
        }
      });
    });
    test.end();
  });
}

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

function Permissions(bitPerms) {
  if (bitPerms === true) {
    return {general: true}
  }
  return {
    general: (bitPerms & permFlags.ADMINISTRATOR) ? true : false // ADMINISTRATOR
  }
}

// Taken from discord.js (https://github.com/hydrabolt/discord.js/)
const permFlags = {
  CREATE_INSTANT_INVITE: 1 << 0,
  KICK_MEMBERS: 1 << 1,
  BAN_MEMBERS: 1 << 2,
  ADMINISTRATOR: 1 << 3,
  MANAGE_CHANNELS: 1 << 4,
  MANAGE_GUILD: 1 << 5,
  ADD_REACTIONS: 1 << 6,
  VIEW_AUDIT_LOG: 1 << 7,

  READ_MESSAGES: 1 << 10,
  SEND_MESSAGES: 1 << 11,
  SEND_TTS_MESSAGES: 1 << 12,
  MANAGE_MESSAGES: 1 << 13,
  EMBED_LINKS: 1 << 14,
  ATTACH_FILES: 1 << 15,
  READ_MESSAGE_HISTORY: 1 << 16,
  MENTION_EVERYONE: 1 << 17,
  USE_EXTERNAL_EMOJIS: 1 << 18,

  CONNECT: 1 << 20,
  SPEAK: 1 << 21,
  MUTE_MEMBERS: 1 << 22,
  DEAFEN_MEMBERS: 1 << 23,
  MOVE_MEMBERS: 1 << 24,
  USE_VAD: 1 << 25,

  CHANGE_NICKNAME: 1 << 26,
  MANAGE_NICKNAMES: 1 << 27,
  MANAGE_ROLES: 1 << 28,
  MANAGE_WEBHOOKS: 1 << 29,
  MANAGE_EMOJIS: 1 << 30,
};

module.exports = router;
