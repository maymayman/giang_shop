const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const cookie = require('cookie');

const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

global.domain = process.env.DOMAIN || 'http://localhost:1337/'

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const options = { allowInsecureHTTP: true };
const dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.SERVER_URL || 'http://localhost:1337/api',
      "appId": process.env.APP_ID || 'myAppId',
      "masterKey": process.env.MASTER_KEY || 'myMasterKey',
      "appName": process.env.APP_NAME || 'GiangShop'
    }
  ],
  "users": [
    {
      "user":"admin",
      "pass":"root@admin"
    }
  ],
  "useEncryptedPasswords": false,
  "allowInsecureHTTP": true,
}, options);

const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://vietduc:giangshop2019@ds229186.mlab.com:29186/giangshop',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/api',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  logLevel: 'info'
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/api';
app.use(mountPath, api);

Parse.Error.LOGIN_REQUIRE = 700;
Parse.Error.INVALID_DATA = 701;

// define Parse Cache
Parse.Cache = {};

app.use('/dashboard', dashboard);

// view engine setup
app.set('views', path.join(__dirname, 'views/v3'));
app.set('view engine', 'ejs');

app.use(async function (req, res, next) {
  const cookies = cookie.parse(req.headers.cookie || '');
  req.cookies = cookies;

  const responseUser = cookies['X-Session-Token']
    ? await Parse.Cloud.httpRequest({
      url: Parse.serverURL + '/users/me',
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID || 'myAppId',
        'X-Parse-Session-Token': cookies['X-Session-Token']
      }
    })
    : {};
  
  req.user = responseUser.data;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// error handler
app.use(function(err, req, res, next) {
  console.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Parse Server plays nicely with the rest of your web routes
app.use('/', function(req, res) {
  res.status(404).send('I dream of being a website. But not found');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
// app.get('/test', function(req, res) {
//   res.sendFile(path.join(__dirname, '/public/test.html'));
// });

const port = process.env.PORT || 1337;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
