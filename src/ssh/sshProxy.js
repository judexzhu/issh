const sshClient = require('ssh2').Client;
const url = require('url');

exports.handler = (wss) => {
  wss.on('connection', (ws, req) => {
    let querys = url.parse(req.url, true).query;
    install_ws_ssh(ws, querys);
    install_ws_listeners(ws);
  });

  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping('', false, true);
    });
  }, 30000);
}

let install_ws_listeners = (ws) => {
  
  ws.isAlive = true;
  ws.sshClient.command = '';
  ws.on('pong', () => this.isAlive = true);

  ws.on('message', (message) => {
    console.log('received: %s', message);
    ws.sshClient.stream && ws.sshClient.stream.write(message);
  });

  ws.on('close', () => {
    ws.sshClient.end();
    console.log('closed');
  });
}

let install_ws_ssh = (ws, querys) => {
  ws.sshClient = new sshClient();

  ws.sshClient.connect({
    host: querys.host,
    port: querys.port || 22,
    username: querys.user,
    password: querys.password
  });

  ws.sshClient
    .on('ready', () => {
      ws.send('ssh ready');
      ws.sshClient.shell({
        rows: querys.rows,
        cols: querys.cols
      }, (err, stream) => {
        if (err) throw err;
        ws.sshClient.stream = stream;
        stream.on('close', (code, signal) => {
          ws.close();
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        }).on('data', (data) => {
          ws.sshClient.command = '';
          ws.send(data.toString());
        }).stderr.on('data', (data) => {
          ws.sshClient.command = '';
          ws.send(data.toString());
        });
      });
    })
    .on('error', (err) => {
      ws.send(err.toString());
    });
}

