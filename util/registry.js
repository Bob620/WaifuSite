const crypto = require('crypto');

const Collection = require('./collection.js'),
      Requests = require('./discordrequests.js');

const requests = new Requests('https://waifubot.moe');

/** Session {
 *    sessionId: string,
 *    token: (string|undefined),
 *    expires: (number|undefined),
 *    refreshed: (number|undefined)
 * }
 */

function generateUuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
}

class Registry {
  constructor() {
    this.refreshTokens = new Collection();
    this.activeSessions = new Collection();

    setInterval(() => {
    	this.activeSessions.forEach((session, sessionId) => {
		    if (session.expires <= Math.floor(Date.now() / 1000)) {
			    this.removeSession(sessionId);
		    }
    	});
    }, 300000);
  }

  isActiveSession(sessionId) {
  	try {
		  const session = this.activeSessions.get(sessionId);
			if (session.expires <= Math.floor(Date.now() / 1000)+10000) {
				this.refreshSession(sessionId);
				return true;
			} else {
				if (session.expires <= Math.floor(Date.now() / 1000)) {
					this.removeSession(sessionId);
				} else {
					return true;
				}
			}
			return false;
	  } catch (err) {
  		return false;
	  }
  }

  async createSession(code) {
    const sessionId = generateUuid();
    try {
      this.activeSessions.set(sessionId, {sessionId});
      
      const session = this.activeSessions.get(sessionId);
      const {token, expires, refreshed, refreshToken} = await requests.requestToken(code);

      session.token = token;
      session.expires = expires;
      session.refreshed = refreshed;
      this.refreshTokens.set(sessionId, refreshToken);
      return {sessionId, expires};
    } catch(err) {
      console.log(err);
      this.removeSession(sessionId);
      throw err;
    }
  }

  refreshSession(sessionId) {
    return this.refreshToken(sessionId);
  }

  removeSession(sessionId) {
    this.revokeToken(sessionId);
    this.activeSessions.delete(sessionId);
  }

  async refreshToken(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      const {token, expires, refreshed, refreshToken} = await requests.refreshToken(this.refreshTokens.get(sessionId));

      session.token = token;
      session.expires = expires;
      session.refreshed = refreshed;
      this.refreshTokens.set(sessionId, refreshToken);
      return true;
    } catch(err) {
      console.log(err);
      this.removeSession(sessionId);
      return false;
    }
  }

  async revokeToken(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      await requests.revokeToken(session.token);

      session.token = undefined;
      session.expires = undefined;

      this.refreshTokens.delete(sessionId);

      return true;
    } catch(err) {
      console.log(err);
      this.refreshTokens.delete(sessionId);
      return true;
    }
  }
}

module.exports = new Registry();