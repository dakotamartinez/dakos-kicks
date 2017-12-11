const https = require('https');
const Nonce = require('../nonce/nonce.js');

class SlackWebClient {

  constructor(opts = {}) {
    this.host = 'slack.com';
    this.basePath = '/api';
    this.token = opts.token || process.env.SLACK_OAUTH_ACCESS_TOKEN;
    this.clientId = opts.clientId || process.env.SLACK_CLIENT_ID;
    this.clientSecret = opts.clientSecret || process.env.SLACK_CLIENT_SECRET;

    this.isBot = false;
  }

  bot() {
    this.isBot = true;
    this.token = process.env.SLACK_BOT_ACCESS_TOKEN;

    return this;
  }

  async callMethod(method, options = {}) {
    const defaultOpts = {};

    const opts = {
      host: this.host,
      path: `${options.basePath || this.basePath}/${method}`,
      form: Object.assign({}, defaultOpts, options),
      headers: {
        'User-Agent': 'DakosKicksListener_SlackApp/0.0.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(opts, res => {
        const { statusCode } = res;
        let responseBody = '';

        res.on('data', chunk => (responseBody += chunk));

        res.on('end', () => {
          if (statusCode >= 300) {
            const errType = 'Error returned from method';
            const message = { errType, method, options, statusCode, responseBody };
            
            return reject(new Error(JSON.stringify(message)));
          }

          const data = JSON.parse(responseBody);
          return resolve(data);
        });
      });

      req.on('error', err => reject(err));
      
      req.end();
    });
  }


  async getChannelHistory(channel) {
    const opts = { channel: channel.id };
    const result = await this.callMethod('channels.history', opts);

    return result;
  }


  async listChannels() {
    const result = await this.callMethod('channels.list');

    if (!result.ok) {
      return null;
    }

    return result.channels;
  }

}

module.exports = SlackWebClient;
