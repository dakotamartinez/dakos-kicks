const bodyParser = require('body-parser');
const express = require('express');
const Router = require('./src/router/router.js');

const app = express();

app.use(bodyParser.json());
app.use('/v1', new Router({ app }).route());

app.use('/assets', express.static('static', { index: ['index.html'] }));

app.use((req, res, next) => {
  const url = req.originalUrl;
  const body = req.body;
  const params = req.params;

  console.error('Not found', { url, body, params });

  const statusCode = 404;
  const message = 'Not found';
  
  res
    .status(statusCode)
    .json({ statusCode, message });
});

app.use((err, req, res, next) => {
  console.error('Uncaught error', err);

  const statusCode = 500;
  const message = 'Unknown Error';

  res
    .status(statusCode)
    .json({ statusCode, message });
});

module.exports = app;
