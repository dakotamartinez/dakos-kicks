require('dotenv').config();

const Db = require('../../src/db/db.js');

const db = Db.connect();

const records = [
  { size: 'small', value: 1 },
  { size: 'medium', value: 7 },
  { size: 'large', value: 8 },
  { size: 'huge', value: 2 },
]

db.waitForConnection()
  .then(() => db.createTable('thing'))
  .then(result => {
    if (result) {
      console.log(result)
    }
  })
  .catch(err => console.log('create table error', err))
  
  .then(() => db.insert('thing', records))
  .then(result => console.log(result))
  .catch(err => console.log('insert error', err))

  .then(() => db.fetchAll('thing'))
  .then(result => (result
    .sort((a, b) => (Math.random() > 0.5 ? -1 : 1))
    .slice(0, Math.ceil(Math.random() * 3))
    .map(item => item.id)))
  .catch(err => console.log('fetchAll error', err))

  .then(ids => db.findById('thing', ids))
  .then(result => {
    console.log('result', result);
    return result[0];
  })
  .catch(err => console.log('findById error', err))

  .then(item => db.update('thing', item.id, { foo: 'bar' })
    .then(() => db.findById('thing', item.id))
    .then(result => console.log('updated result', result))
    .catch(err => console.log('update error', err))
    .then(() => db.delete('thing', item.id))
    .catch(err => console.log('delete error', err))
    .then(() => db.findById('thing', item.id))
    .then(result => console.log('deleted result', result)))

// db.connect()
//   .then(result => console.log('done with connect'))
//   .catch(err => console.log('error connecting', err));