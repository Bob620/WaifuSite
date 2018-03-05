const kagi = require('kagi');

// Waifu Storage
const dynamoDB = require('dynamoDB').DynamoDB(kagi.getChain('kagi.chn').getLink('credentials'));

dynamoDB.getItem({

});

class Database {
  constructor() {

  }
}

module.exports = Database;

/**
 * - Get user guilds
 * - Get bot guilds
 * - Get user settings
 * - Get guild settings
 */