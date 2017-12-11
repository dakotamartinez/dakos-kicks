require('dotenv').config();
const RTMClient = require('../../src/slack/rtm-client.js');

const client = new RTMClient();

client.on('ready', () => {
  console.log('client is ready');
})

client.on('channel-message', message => {
  console.log('message', message);
})

client.connect()
  .then(result => console.log('connected'))
  .catch(err => console.log(err));