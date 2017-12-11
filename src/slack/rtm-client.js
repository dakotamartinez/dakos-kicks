const EventEmitter = require('events').EventEmitter;
const WebClient = require('./web-client');
const WebSocket = require('ws');

class RTMClient extends EventEmitter {

  constructor(...args) {
    super(...args);

    this.socket = null;
  }

  async connect() {
    const webClient = new WebClient();
    const result = await webClient
      .bot()
      .callMethod('rtm.connect');

    if (result.ok !== true) {
      console.log('cannot connect', result);
      // do something intelligent in response to a failed connection
      return null;
    }

    return new Promise(resolve => {
      this.on('ready', () => resolve());

      this.socket = new WebSocket(result.url);
      this.socket.on('open', () => this.onSocketOpened());
      this.socket.on('message', message => this.onSocketMessage(message));
      this.socket.on('close', (code, reason) => this.onSocketClose(code, reason));
      this.socket.on('error', err => this.onSocketError(err));
    });
  }

  onSocketOpened() {
    this.closed = false;
  }

  onSocketMessage(json) {
    const data = JSON.parse(json);
    
    if (data.type === 'hello') {
      this.emit('ready');
    }

    if (data.type === 'message') {
      this.emit('channel-message', {
        channel: data.channel,
        user: data.user,
        timestamp: data.ts,
        text: data.text,
      })
    }
  }

  onSocketClose(code, reason) {
    this.closed = true;
    this.closedCode = code;
    this.closedReason = reason;
    this.socket = null;

    this.emit('socket-closed');
  }

  onSocketError(err) {
    this.closed = true;
    this.closedCode = -1;
    this.closedReason = 'error';
    this.socket = null;

    console.error('Websocket error', err);

    this.emit('socket-error');
  }

}

module.exports = RTMClient;