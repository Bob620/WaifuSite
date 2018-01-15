const kagi = require('kagi');

class DiscordRequests {
  constructor(returnUrl='') {
    this.returnUrl = returnUrl;
  }

  requestOptions(path, method='POST') {
    return {
      path,
      hostname: 'discordapp.com', method, port: '443', headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'WaifuBot (https://github.com/Bob620/waifusite, 1.0.0)'
      }
    }
  }

  requestToken(code) {
    return new Promise((resolve, reject) => {
      const waifusitekagi = kagi.getChain('waifusecret.chn').getLink('website');
      const authRequest = https.request(
        this.requestOptions(`/api/oauth2/token?client_id=${waifusitekagi.username}&client_secret=${waifusitekagi.password}&grant_type=authorization_code&${this.returnUrl !== '' ? `redirect_uri=${this.returnUrl}/api/auth` : ''}&code=${code}`),
      (res) => {
        res.setEncoding('utf8');

        let session = {};
  
        res.on('data', (data) => {
          const jsondata = JSON.parse(data);
          if (jsondata.access_token !== undefined || jsondata.expires_in !== undefined) {
            session.token = jsondata.access_token;
            session.refreshed = Math.floor(Date.now()/1000);
            session.expires = session.refreshed+jsondata.expires_in;
            session.refreshToken = jsondata.refresh_token;
          }
        });
  
        res.on('end', () => {
          if (session.token !== undefined) {
            resolve(session);
          } else {
            reject('Failed to retrive a new token');
          }
        });
      });

      authRequest.end();
    });
  }

  refreshToken(token) {
    return new Promise((resolve, reject) => {
      const waifusitekagi = kagi.getChain('waifusecret.chn').getLink('website');
      const authRequest = https.request(
        this.requestOptions(`/api/oauth2/token?client_id=${waifusitekagi.username}&client_secret=${waifusitekagi.password}&grant_type=refresh_token&${this.returnUrl !== ''? `redirect_uri=${this.returnUrl}/api/auth` : ''}&refresh_token=${token}`),
      (res) => {
        res.setEncoding('utf8');

        let session = {};
  
        res.on('data', (data) => {
          const jsondata = JSON.parse(data);
          if (jsondata.access_token !== undefined || jsondata.expires_in !== undefined) {
            session.token = jsondata.access_token;
            session.refreshed = Math.floor(Date.now()/1000);
            session.expires = session.refreshed+jsondata.expires_in;
            session.refreshToken = jsondata.refresh_token;
          }
        });
  
        res.on('end', () => {
          if (session.token !== undefined) {
            resolve(session);
          } else {
            reject('Failed to retrive a refreshed token');
          }
        });
      });

      authRequest.end();
    });
  }

  revokeToken(token) {
    return new Promise((resolve, reject) => {
      const authRequest = https.request(
        this.requestOptions(`/api/oauth2/token/revoke?client_id=${kagi.getChain('waifusecret.chn').getLink('website').username}&token=${session.token}`, 'GET'),
      (res) => {
        res.setEncoding('utf8');
  
        res.on('data', (data) => {
          console.log(data);
        });
  
        res.on('end', () => {
          resolve();
        });
      });

      authRequest.end();
    });
  }
}

module.exports = DiscordRequests;