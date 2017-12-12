const express = require('express');
const Cart = require('../cart/cart');
const Checkout = require('./checkout');

class CheckoutRouter {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {

    this.router.post('/', async (req, res, next) => {
      console.log('lookup up cart', req.body.item.id);
      const cart = await Cart.findById(req.body.item.id);;

      console.log('creating charge');
      const checkout = new Checkout(cart, req.body.token);

      try {
        const charge = await checkout.createCharge();
        const { id, email, password, url } = cart;
        const success = true;
        const payload = { success, id, email, password, url };

        console.log('charge successful');
        
        res.status(200).json(payload);
        
      } catch(err) {
        if (err.message === 'charge unsuccessful') {
          return res.status(400).json({
            success: false,
            message: 'charge unsuccessful',
          });
        }

        console.error('Error creating charge', err);

        return res.status(500).json({
          success: false,
          message: 'charge failed due to unknown reason',
        })
      }
    })

    return this.router;
  }
}


module.exports = CheckoutRouter;
