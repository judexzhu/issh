const path = require('path');
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const bodyParser = require("body-parser");
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const sshProxy = require('./ssh/sshProxy');

let app = express();

let port = process.env.ISSH_PORT || 9999;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

app.use(session({
  secret: "issh",
  name: "_issh.session.id",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 4 * 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

require('./passport/passportConfig');
require('./routes/ssh-routes')(app);

app.use(errorHandler());

let server = http.createServer(app);
let wss = new WebSocket.Server({ server: server, maxPayload: 1000 });
sshProxy.handler(wss);

server.listen(port, function listening() {
  console.log(`Listening on ${server.address().address}:${server.address().port}`);
});