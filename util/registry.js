const Collection = require('./collection.js'),
      requests = require('./discordrequests.js')('http://localhost');

/** Session {
 *    token: (string|undefined)
 *    expires: (number|undefined)
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
        const offest = Math.floor(Date.now()/1000) - session.refreshed;
        if (offset < 300000) {
          session.expires -= offset;
        } else {
          session.expires -= 300000;
        }
        if (session.expires <= 0) {
          this.activeSessions.delete(sessionId);
        }
      });
    }, 300000);
  }

  isActiveSession(sessionId) {
    if (sessionId !== undefined && this.activeSessions.has(sessionId)) {
      return true;
    }
    return false;
  }

  refreshSession(sessionId) {
    this.refreshToken(sessionId);
  }

  createSession() {
    const sessionId = generateUuid();
    this.activeSessions.set(sessionid, new Session(sessionId))
    return session;
  }

  removeSession(sessionId) {
    this.revokeToken(sessionId);
    this.activeSessions.delete(sessionId);
  }

  async requestToken(sessionId, code) {
    try {
      const session = this.activeSessions.get(sessionId);
      const {token, expires, refreshed, refreshToken} = await requests.requestToken(code);

      session.token = token;
      session.expires = expires;
      session.refreshed = refreshed;
      this.refreshTokens.set(refreshToken);
      return true;
    } catch(err) {
      console.log(err);
      this.removeSession(sessionId);
      return false;
    }
  }

  async refreshToken(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      const {token, expires, refreshed, refreshToken} = await requests.refreshToken(this.refreshTokens.get(sessionId));

      session.token = token;
      session.expires = expires;
      session.refreshed = refreshed;
      this.refreshTokens.set(refreshToken);
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

module.exports = Registry();