const db = require('../db/db');
const EventEmitter = require('events').EventEmitter;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


class Checkout extends EventEmitter {

  constructor(cart, token) {
    super();

    this.cart = cart;
    this.token = token;
    this.paid = false;
  }
  
  static get tableName() {
    return 'checkout';
  }


  async createCharge() {
    // this.cart.token = this.token;
    // const update = await db.update(this.cart);

    return new Promise((resolve, reject) => {
      const amount =  parseInt(this.cart.price || process.env.APP_DEFAULT_PRICE, 10);
      const currency =  this.cart.currency || process.env.APP_DEFAULT_CURRENCY || 'usd';
      const description =  this.cart.description;
      const source =  this.token.id;
      const opts = { amount, currency, description, source };

      stripe.charges.create(opts, async (err, charge) => {
        if (err) {
          console.log('error creating charge', {
            err,
            cart: this.cart,
            token: this.token,
          });

          return reject(err);
        }
        
        if (charge.paid === true) {
          console.log('charge successful');

          this.cart.charge = charge;
          await db.update(this.cart);
          await db.delete(this.cart);

          return resolve(this);
        }

        console.log('charge unsuccessful');
        console.log(JSON.stringify(charge, ' ', 2));

        return reject(new Error('charge unsuccessful'));
      });
    });
  }


}

module.exports = Checkout;
