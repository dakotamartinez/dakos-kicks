const EventEmitter = require('events').EventEmitter;
const r = require('rethinkdb');

let conn;
let connecting = false;
let instance;

class Db extends EventEmitter {
  
  static connect() {
    if (!(instance instanceof this)) {
      instance = new this();
    }

    return instance;
  }

  constructor(options = {}) {
    super();

    this.r = r;
    this.host = options.host || process.env.DB_SERVER;
    this.port = options.port || process.env.DB_PORT;
    this.db = options.db || process.env.DB_NAME || 'test'

    this._connect();
  }

  set conn(value) {
    conn = value;
  }

  get conn() {
    return conn;
  }

  async _connect() {
    if (conn) {
      this.emit('connected');
      return conn;
    }
    if (connecting) {
      return this.waitForConnection();
    }

    connecting = true;
    const { host, port, db } = this;
    
    r.connect({ host, port, db }, (err, result) => {
      connecting = false;

      if (err) {
        this.emit('connection-error', err);
        return;
      }

      conn = result;
      this.emit('connected');
    })
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.conn.close(err => {
        if (err) {
          return reject(err);
        }

        return resolve();
      })
    })
  }

  static resolveTableName(nameOrClass) {
    let tableName = nameOrClass;

    if (nameOrClass instanceof Function && nameOrClass.tableName != null) {
      tableName = nameOrClass.tableName;
    }

    if (
      nameOrClass instanceof Object &&
      nameOrClass != null &&
      nameOrClass.constructor instanceof Function &&
      nameOrClass.constructor.tableName != null) {
        tableName = nameOrClass.constructor.tableName;
    }

    return tableName;
  }

  static resolveIds(stringArrayClass, overrideValues) {
    if (Array.isArray(overrideValues) && overrideValues.length) {
      return overrideValues;
    }

    if (typeof overrideValues === 'string' && overrideValues.length) {
      return [overrideValues];
    }


    if (typeof stringArrayClass === 'string') {
      return [stringArrayClass];
    }

    if (Array.isArray(stringArrayClass)) {
      return stringArrayClass;
    }
    
    if (
      stringArrayClass instanceof Object &&
      stringArrayClass != null &&
      stringArrayClass.constructor instanceof Function &&
      stringArrayClass.id != null) {
        return [stringArrayClass.id];
    }

    return null;
  }

  async waitForConnection() {
    if (this.conn == null) {
      return new Promise((resolve, reject) => {
        this.once('connected', () => resolve(this.conn));
        this.once('connection-error', err => reject(err));
      });
    }

    return this.conn;
  }

  async createDb(dbName) {
    const conn = await this.waitForConnection();

    return new Promise((resolve, reject) => {
      r.dbCreate(dbName)
        .run(conn, (err, result) => {
          if (!err) {
            return reject(err);
          }

          if (err.msg.endsWith('already exists.')) {
            return resolve(null);
          }

          return resolve(result);
        })
    })
  }

  async createTable(nameOrClass) {
    const conn = await this.waitForConnection();
    const tableName = this.constructor.resolveTableName(nameOrClass);

    return new Promise((resolve, reject) => {
      r.tableCreate(tableName)
        .run(conn, (err, result) => {
          if (!err) {
            return resolve(result);
          }
          
          if (err.msg.endsWith('already exists.')) {
            return resolve(null);
          }

          return reject(err);
        })
    })
  }

  async insert(nameOrClass, records = []) {
    const conn = await this.waitForConnection();
    const tableName = this.constructor.resolveTableName(nameOrClass);

    if (
      nameOrClass instanceof Object &&
      nameOrClass != null &&
      nameOrClass.constructor instanceof Function &&
      (!Array.isArray(records) || !records.length) &&
      nameOrClass.id == null
    ) {
      const props = nameOrClass.constructor.properties;
      const instance = Object.keys(props)
        .reduce((result, key) => {
          if (nameOrClass[key] != null) {
            result[key] = nameOrClass[key];
          }

          return result;
        }, {});

      records.push(instance);
    }

    const defaultKeys = {
      _created: Date.now(),
      _deleted: false,
    }

    const payload = records.map(item => Object.assign({}, defaultKeys, item))

    return new Promise((resolve, reject) => {
      r.table(tableName)
        .insert(payload)
        .run(conn, (err, result) => {
          if (!err) {
            return resolve(result);
          }

          return reject(err);
        })
    })
  }


  /**
   * Fetches all documents in a table, coercing into an array for return.  Note:
   * with very large tables, this method may break.
   * 
   * @param {string} tableName
   * @returns 
   * @memberof Db
   */
  async fetchAll(nameOrClass) {
    const conn = await this.waitForConnection();
    const tableName = this.constructor.resolveTableName(nameOrClass);

    return new Promise((resolve, reject) => {
      r.table(tableName)
        .filter(r.row('_deleted').ne(true))
        .run(conn, (err, cursor) => {
          if (!err) {
            let result = cursor.toArray();
            if (nameOrClass instanceof Function) {
              result = result.map(data => new nameOrClass(data));
            }

            return resolve(result);
          }

          return reject(err);
        })
    })
  }
 

  /**
   * find all documents in table with IDs as provided
   * 
   * @param {string} tableName 
   * @param {string|Array} [ids=[]] 
   * @returns 
   * @memberof Db
   */
  async findById(nameOrClass, ids = []) {
    const conn = await this.waitForConnection();
    const keys = this.constructor.resolveIds(nameOrClass, ids);
    const tableName = this.constructor.resolveTableName(nameOrClass);

    return new Promise((resolve, reject) => {
      r.table(tableName)
        .getAll(...keys)
        .run(conn, (err, cursor) => {
          if (!err) {
            return resolve(cursor.toArray());
          }

          return reject(err);
        });
    });
  }


  async update(nameOrClass, id, payload = {}) {
    const conn = await this.waitForConnection();
    const tableName = this.constructor.resolveTableName(nameOrClass);
    const key = this.constructor.resolveIds(nameOrClass, id);

    if (
      nameOrClass instanceof Object &&
      nameOrClass != null &&
      nameOrClass.constructor instanceof Function &&
      nameOrClass.id != null &&
      id == null &&
      !Object.keys(payload).length
    ) {
      id = nameOrClass.id;
      payload = await nameOrClass.updatePayload();
    }
    
    // check for noop
    if (payload == null || !Object.keys(payload).length) {
      return null;
    }

    return new Promise((resolve, reject) => {
      r.table(tableName)
        .get(key)
        .update(payload)
        .run(conn, (err, result) => {
          if (!err) {
            return resolve(result);
          }

          return reject(err);
        });
    });
  }


  async delete(nameOrClass, ids = []) {
    const conn = await this.waitForConnection();
    const keys = this.constructor.resolveIds(nameOrClass, ids);
    const tableName = this.constructor.resolveTableName(nameOrClass);

    return new Promise((resolve, reject) => {
      r.table(tableName)
        .getAll(...keys)
        .update({ _deleted: true })
        .run(conn, (err, result) => {
          if (!err) {
            return resolve(result);
          }

          return reject(err);
        })
    })
  }

}

module.exports = Db;
