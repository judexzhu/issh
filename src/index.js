const path = require('path');
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

let app = express();

let port = process.env.ISSH_PORT || 9999;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

let server = http.createServer(app);
let wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  let location = url.parse(req.url, true);

  ws.on('message', (message) => {
    console.log('received: %s', message);
  });

});

server.listen(port, function listening() {
  console.log(`Listening on ${server.address().address}:${server.address().port}`);
});