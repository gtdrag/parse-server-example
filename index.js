// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://georgethegarbageman:l1tter@ds121456.mlab.com:21456/heroku_mw1pw1hj',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'nNt9aMCyZCA35HQ29ZM7KftdpQI0QrtA6XXAuj4J',
  masterKey: process.env.MASTER_KEY || '8675309', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://tranquil-mountain-95046.herokuapp.com/parse',  // Don't forget to change to https if needed
  push: {
  ios: [
    {
      pfx: 'Push.p12',
      bundleId: 'com.superhead.berner',
      production: true
    }
  ]
},

  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var dashboard = new ParseDashboard({
  users: [{
    user: 'admin',
    pass: 'H3ct0r08'
  }],
  apps: [{
    serverURL: process.env.SERVER_URL + process.env.PARSE_MOUNT || '',
    appId: process.env.APP_ID || 'garbage-hoodie',
    masterKey: process.env.MASTER_KEY || 'RN87nJP1ldqZOqFVTp3umWTC5ivl9V7Ee3P3Li7S',
    appName: process.env.APP_NAME || 'GarbageHoodie',
    iconName: 'icon-garbage.png'
  }],
  "iconsFolder": "appicons"
}, allowInsecureHTTP);

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

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
