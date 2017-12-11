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
  .then(channel => {
    console.log('channel result', channel);
    return channel;
  })
  .catch(err => console.error('channel lookup error', err))

  .then(channel => client
      .asBot()
      .getChannelInfo(channel))
  .then(result => {
    client.endAsBot();
    console.log('channel info', result);
  })
  .catch(err => console.error('channel info error', err))

// client.fetchAuthCode('bot')
//   .then(result => console.log('RESULT', result))
//   .catch(err => console.error('ERROR', err))