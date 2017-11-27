// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var allowInsecureHTTP = true;

//var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var databaseUri = 'mongodb://georgethegarbageman:l1tter@ds121456.mlab.com:21456/heroku_mw1pw1hj';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'garbage-hoodie',
  masterKey: process.env.MASTER_KEY || '8675309', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL + process.env.PARSE_MOUNT || 'https://garbage-hoodie.herokuapp.com/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
    appName : 'GarbageHoodie',
  verifyUserEmails: true,
  publicServerURL: 'https://garbage-hoodie.herokuapp.com/parse',
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      fromAddress: process.env.EMAIL_FROM || "email-from@example.com",
      domain: process.env.MAILGUN_DOMAIN || "example.com",
      apiKey: process.env.MAILGUN_API_KEY || "API-Key",
      // Verification email subject
      verificationSubject: 'Please verify your e-mail for %appname%',
      // Verification email body
      verificationBody: 'Hi,\n\nYou are being asked to confirm the e-mail address %email% with %appname%\n\nClick here to confirm it:\n%link%',

      // Password reset email subject
      passwordResetSubject: 'Password Reset Request for %appname%',
      // Password reset email body
      passwordResetBody: 'Hi,\n\nYou requested a password reset for %appname%.\n\nClick here to reset it:\n%link%',
      //OPTIONAL (will send HTML version of email):
      passwordResetBodyHTML: "<!--DOCTYPE html>........"
    }
  },
  push: {
      android: {
      senderId: '',
      apiKey: ''
    },
    ios: {
      pfx: '',
      passphrase: '', // optional password to your p12/PFX
      bundleId: '',
      production: false
    }
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var dashboard = new ParseDashboard({
  users: [{
    user: 'admin',
    pass: 'H3ct0r08!'
  }],
  apps: [{
    serverURL: process.env.SERVER_URL + process.env.PARSE_MOUNT || '',
    appId: process.env.APP_ID || '',
    masterKey: process.env.MASTER_KEY || '',
    appName: process.env.APP_NAME || 'GarbageHoodie',
    iconName: 'icon-garbage.png'
  }],
  "iconsFolder": "appicons"
}, allowInsecureHTTP);

var app = express();

app.use(function(req, res, next) {
  req.headers['x-real-ip'] = req.ip;
  next();
});

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

//start the dashboard
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
