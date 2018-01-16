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
    res.render('index', { bundle: 'home.js' });
  } else {
    res.render('index', { bundle: 'index.js' });
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
  res.redirect('/api/logout');
});

/* GET collector landing page. */
router.get('/collector', (req, res, next) => {
  res.render('index', { bundle: 'collector.js' });
});






/* Background Functions */

/**
 * Retrives waifubot's guilds
 * @returns {Promise} Waifu's Guilds
 */
function getBotGuilds() {
  return new Promise((resolve, reject) => {
    let guilds = '';

    const test = http.request({
      path: '/api/guilds',
      hostname: 'bot.waifubot.moe', method: 'GET', port: '80', headers: {
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
        'User-Agent': 'DiscordBot (https://github.com/Bob620/waifusite, 2.1.0)'
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
        'User-Agent': 'DiscordBot (https://github.com/Bob620/waifusite, 2.1.0)'
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
        'User-Agent': 'DiscordBot (https://github.com/Bob620/waifusite, 2.1.0)'
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
