const express = require('express'),
      kagi = require('kagi'),
      registry = require('../util/registry.js');

// This Web Server
const router = express.Router();

/* API calls */

/* User API */
router.get('/users/:userId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (registry.isActiveSession(sessionId)) {
    res.status(202);
    switch(req.params.userId) {
      case '@me':
        // Send user info (archived getUser)
        //res.status(200).json(user);
        //res.status(403).json(err);
        res.status(503).end();
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
router.get('/users/@me/guilds', (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (registry.isActiveSession(sessionId)) {
    res.status(202);
    // archived getBotGuilds -> archived getGuilds -> Cross refrence and send the guilds waifu is in to the user
    res.status(503).end();
  } else {
    res.status(403).end();
  }
});

/* Guild API */
router.get('/guilds/:guildId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  const guildId = req.params.guildId.toString();

  if (registry.isActiveSession(sessionId) && guildId !== undefined) {
    res.status(202);
    // archived getGuilds -> dynamo call to get the guild -> return guild info
    res.status(503).end();
  } else {
    res.status(403).end();
  }
});

router.post('/guilds/:guildId', (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  const guildId = req.params.guildId.toString();

  if (registry.isActiveSession(sessionId)) {
    res.status(202);
    // archived getGuilds -> dynamo call to get guild -> check perms -> update guild -> dynamo call to update guild
    res.status(503).end();
  } else {
    res.status(403).end();
  }
});

/* Authenitcation API */
router.get('/auth', async (req, res, next) => {
  res.status(202);
  try {
    // Authenticate
    const {sessionId, expires} = await registry.createSession(req.query.code);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      path: '/',
      expires: expires,
      maxAge: expires
    });

    res.redirect(303, '/');
  } catch(err) {
    console.log(err);
    res.redirect('/error/401');
  }
});

/* logout page. */
router.get('/logout', (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (registry.isActiveSession(sessionId)) {
    registry.removeSession(sessionId);
    res.clearCookie(sessionId);
    res.redirect('/');
  } else {
    res.clearCookie(sessionId);
    res.redirect('/');
  }
});

module.exports = router;