require('dotenv').config();
const WebClient = require('../../src/slack/web-client.js');

const client = new WebClient();

client
  // .bot()
  // .joinChannel('adidascarts')
  .listChannels()
  .then(channels => {
    const channel = channels
      .filter(item => item.name === 'adidascarts')
      .pop();

    return channel;
  })
  .then(result => console.log('RESULT', result))
  .catch(err => console.error('ERROR', err))

// client.fetchAuthCode('bot')
//   .then(result => console.log('RESULT', result))
//   .catch(err => console.error('ERROR', err))