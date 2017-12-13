const Cart = require('../cart/cart');
const db = require('../db/db');
const EventEmitter = require('events').EventEmitter;
const RTMClient = require('../slack/rtm-client');
const WebClient = require('../slack/web-client');

class Bot extends EventEmitter {

  constructor() {
    super();

    this.rtmClient = new RTMClient();
    this.webClient = new WebClient();

    this.ready = false;
    this.init();
  }


  async waitUntilReady() {
    if (this.ready === true) {
      return this;
    }

    return new Promise(resolve => this.once('ready', () => resolve()))
  }


  init() {
    return this.rtmClient.connect()
      .then(() => this.attachListeners())
      .then(() => db.createDb(db.db))
      .then(() => db.createTable(Cart))
      .then(() => {
        this.ready = true;
        this.emit('ready')
      })
      .catch(err => {
        console.log('error in bot init', err);
        this.ready = false;
      })
  }


  attachListeners() {
    this.rtmClient.on('cart', message => this.handleCart(message));
  }


  async handleCart(message) {
    const cart = await Cart.create(message);

    return cart;
  }

}

module.exports = Bot;
