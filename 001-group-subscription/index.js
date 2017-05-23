const config = require('config');
const app = require('./app');
const https = require('https');
const fs = require('fs');
const argv = require('yargs').argv;
const helpers = require('./helpers');

// Configurations
const appConfig = config.get('app');

const subscribe = () => {
  helpers.subscribe((err) => {
    if (!err) console.info('Created subscriptions.');
    else console.error(err);
  });
};

const startApp = () => {
  if (appConfig.developmentKey && appConfig.developmentCert) {
    const httpsOptions = {
      key: fs.readFileSync(appConfig.developmentKey),
      cert: fs.readFileSync(appConfig.developmentCert),
    };

    https.createServer(httpsOptions, app).listen(appConfig.port, () => {
      console.info(`HTTPS development server running at ${appConfig.port}`);
      if (argv.subscribe) subscribe();
    });
  } else {
    app.listen(appConfig.port, () => {
      console.info(`HTTP server running at ${appConfig.port}`);
      if (argv.subscribe) subscribe();
    });
  }
};

startApp();


