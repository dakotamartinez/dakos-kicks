const db = require('../db/db');
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
      url: 'string',
      token: 'object',
      checkout: 'object',
      _deleted: 'string',
    }
  }

  static get tableName() {
    return 'carts';
  }

  get description() {
    return `Account login Size: ${this.size}`
  }

  get url() {
    const message = this.message || {};
    const attachments = message.attachments || [];
    const attachment = attachments[0] || {};

    return attachment.title_link;
  }

  set url(value) {
    const message = this.message || {};
    const attachments = message.attachments || [];
    const attachment = attachments[0] || {};

    if (attachment.title_link == null) {
      attachment.title_link = value;
    }
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
    if (this.id == null) {
      return this.saveNew();
    }

    return db.update(this)
  }
  

  async saveNew() {
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
    const results = await db.fetchAll(this);
    return results;
  }


  static async findById(id) {
    const data = await db.findById(this, id);
    const cart = Array.isArray(data) ? data[0] : data;

    if (cart) {
      return new this(cart);
    }

    return null;
  }


  toJSON() {
    const props = Array.from(new Set([
      'id',
      'sku',
      'size',
      'region',
      'price',
      'currency',
      'description',
      '_deleted',
    ]
      .concat(this._withProps)));

    const defaultValues = {
      sku: process.env.APP_DEFAULT_SKU,
      price: process.env.APP_DEFAULT_PRICE,
      currency: process.env.APP_DEFAULT_CURRENCY,
      description: this.description,
      _deleted: false,
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
    
    values.price = parseInt(values.price, 10);

    return values;
  }

}

module.exports = Cart;
