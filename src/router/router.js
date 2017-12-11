const express = require('express');

class Router {

  constructor(options) {
    this.options = options;
    this.router = express.Router();
  }

  route() {
    // add some smooth routing stuff here

    this.router.get('/', (req, res, next) => {
      console.log(req);

      res.status(200).json({ statusCode: 200 });
    })

    return this.router;
  }
}


module.exports = Router;
