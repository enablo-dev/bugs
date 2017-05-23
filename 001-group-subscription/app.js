const express = require('express');
const bodyParser = require('body-parser');
const helpers = require('./helpers');
const config = require('config');

const facebookConfig = config.get('facebook');

const app = express();

app.use(bodyParser.json({ verify: helpers.verify }));

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === facebookConfig.verifyToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = app;
