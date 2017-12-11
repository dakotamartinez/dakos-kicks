const express = require('express');
const Cart = require('../cart/cart');

class Router {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {
    // add some smooth routing stuff here

    this.router.get('/', async (req, res, next) => {
      const result = await Cart.findAll();
      return res.status(200).json(result);
    })

    return this.router;
  }
}


module.exports = Router;
