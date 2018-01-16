const https = require('http');

const kagi = require('kagi');

// Waifu Storage
const aws = require('aws-sdk');
aws.config.update(kagi.getChain('kagi.chn').getLink('credentials'));
const dynamodbWestTwo = new aws.DynamoDB({apiVersion: '2012-08-10', region: 'us-west-2'});

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