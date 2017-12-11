const express = require('express');
const CartRouter = require('../cart/cart-router');

class Router {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {
    
    this.router.use('/carts', new CartRouter(this.options).route());

    return this.router;
  }
}


module.exports = Router;
