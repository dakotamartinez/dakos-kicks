const express = require('express');
const CartRouter = require('../cart/cart-router');
const CheckoutRouter = require('../checkout/checkout-router');

class Router {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {
    
    this.router.use('/carts', new CartRouter(this.options).route());
    this.router.use('/checkout', new CheckoutRouter(this.options).route());
    
    return this.router;
  }
}


module.exports = Router;
