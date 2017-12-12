const express = require('express');
const Cart = require('../cart/cart');

class CartRouter {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {

    this.router.get('/', async (req, res, next) => {
      const result = await Cart.findAll();
      return res.status(200).json(result);
    })

    return this.router;
  }
}


module.exports = CartRouter;
