const crypto = require('crypto');
const config = require('config');
const request = require('request');

const facebookConfig = config.get('facebook');
const appConfig = config.get('app');

// Used to verify messages from Facebook
const verify = (req, res, buf) => {
  const signature = req.headers['x-hub-signature'];

  if (!signature) {
    throw new Error('Signature is missing, unable to verify body');
  } else {
    const elements = signature.split('=');
    const signatureHash = elements[1];

    const expectedHash =
      crypto
        .createHmac('sha1', facebookConfig.appSecret)
        .update(buf)
        .digest('hex');

    if (signatureHash !== expectedHash) {
      throw new Error('Can\'t validate the request signature.');
    }
  }
};

const facebookRequest = request.defaults({
  baseUrl: 'https://graph.facebook.com',
  headers: {
    Authorization: `Bearer ${facebookConfig.pageAccessToken}`,
    'User-Agent': 'EnabloSpotify/1.0',
  },
});

const subscribe = (cb) => {
  facebookRequest({
    url: '/me/subscribed_apps',
    method: 'POST',
    json: true,
  }, (err, response, body) => {
    if (err || !body.success) cb(new Error('Unable to enable subscriptions for this app.'));
    facebookRequest({
      url: '/app/subscriptions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${facebookConfig.appId}|${facebookConfig.appSecret}`,
      },
      qs: {
        object: 'group',
        fields: 'comments,posts',
        verify_token: facebookConfig.verifyToken,
        callback_url: `${appConfig.publicUrl}/webhook`,
      },
      json: true,
    }, (err, response, body) => {
      if (err || !body.success) {
        console.error(err);
        console.error(body);
        cb(new Error('Unable to enable subscriptions for this app.'));
      } else {
        cb(null);
      }
    });
  });
};

module.exports = {
  verify,
  request: facebookRequest,
  subscribe,
};


