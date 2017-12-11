const Db = require('../db/db');
const EventEmitter = require('events').EventEmitter;
const { URL } = require('url');


class Cart extends EventEmitter {

  constructor(data = {}) {
    super();

    Object.assign(this, data);
  }
  
  static get properties() {
    return {
      id: 'string',
      message: 'string',
      email: 'string',
      password: 'string',
      sku: 'string',
      size: 'string',
      region: 'string',
      imageUrl: 'string',
    }
  }

  static get tableName() {
    return 'carts';
  }

  static get db() {
    return Db.connect();
  }

  async updatePayload() {
    const record = await db.findById(this);
    const result = Object.keys(this.constructor.properties)
      .reduce((prev, key) => {
        if (this[key] !== record[key]) {
          prev[key] = this[key];
        }

        return prev;
      }, {});

    return result;
  }

  async save() {
    const db = this.constructor.db;

    if (this.id == null) {
      return this.saveNew();
    }

    return db.update(this)
  }
  

  async saveNew() {
    const db = this.constructor.db;
    const result = await db.insert(this);

    if (result.inserted !== 1) {
      console.log('ERROR - UNEXPECTED RESULT FROM INSERT OPERATION', result, this);
      return null;
    }

    this.id = result.generated_keys[0];

    return this;
  }


  static async create(data) {
    const { attachments } = data || [];
    const attachment = attachments[0] || {};
    const { text, title, title_link, thumb_url } = attachment;
    const url = new URL(title_link);
    const payload = {};

    payload.message = data;
    payload.email = text.match(/mailto:([^|]*)\|/)[1];
    payload.password = text.match(/Password: (.*)/)[1];
    payload.size = title.match(/Size: (.*)/)[1];
    payload.region = url.locale;
    payload.imageUrl = thumb_url;

    const target = new this(payload);

    return target.save();
  }


  static async findAll() {
    const results = await this.db.fetchAll(this);

    return results;
  }

  toJSON() {
    const props = Array.from(new Set([ 'id', 'sku', 'size', 'region', 'price' ]
      .concat(this._withProps)));

    const defaultValues = {
      sku: process.env.APP_DEFAULT_SKU,
      price: process.env.APP_DEFAULT_PRICE,
    }

    const values = props.reduce((prev, next) => {
      if (defaultValues[next] != null) {
        prev[next] = defaultValues[next];
      }

      if (this[next] != null) {
        prev[next] = this[next];
      }

      return prev;
    }, {});

    console.log(values);

    return values;
  }

}

module.exports = Cart;
