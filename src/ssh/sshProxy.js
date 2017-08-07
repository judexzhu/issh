const sshClient = require('ssh2').Client;
const url = require('url');

exports.handler = (wss) => {
  wss.on('connection', (ws, req) => {
    let querys = url.parse(req.url, true).query;
    install_ws_ssh(ws, querys);
    install_ws_listeners(ws);
  });
}

let install_ws_listeners = (ws) => {

  ws.isAlive = true;
  ws.on('pong', () => this.isAlive = true);

  ws.on('message', (message) => {
    if (message.startsWith('^_^')) {
      message = message.replace('^_^', '');
      size = message.split('|');
      ws.sshClient.stream && ws.sshClient.stream.setWindow(parseInt(size[0]), parseInt(size[1]));
    } else {
      ws.sshClient.stream && ws.sshClient.stream.write(message);
    }
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

      ws.send(" \033[1;3;31m////\033[0m    ////////////////   ////////////////   ////          ////\n");
      ws.send(" \033[1;3;31m/  /\033[0m    /              /   /              /   /  /          /  /\n");
      ws.send(" \033[1;3;31m////\033[0m    /   ////////////   /   ////////////   /  /          /  /\n");
      ws.send(" \033[1;3;31m    \033[0m    /   /              /   /              /  /          /  /\n");
      ws.send(" \033[1;3;31m////\033[0m    /   /              /   /              /  /          /  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m    /   ////////////   /   ////////////   /  ////////////  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m    /              /   /              /   /                /\n");
      ws.send(" \033[1;3;31m/  /\033[0m    ////////////   /   ////////////   /   /  ////////////  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m               /   /              /   /   /  /          /  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m               /   /              /   /   /  /          /  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m    ////////////   /   ////////////   /   /  /          /  /\n");
      ws.send(" \033[1;3;31m/  /\033[0m    /              /   /              /   /  /          /  /\n");
      ws.send(" \033[1;3;31m////\033[0m    ////////////////   ////////////////   ////          ////\n");
      ws.send("\n");

      ws.sshClient.shell({
        rows: parseInt(querys.rows),
        cols: parseInt(querys.cols)
      }, (err, stream) => {
        if (err) throw err;
        ws.sshClient.stream = stream;
        stream.on('close', (code, signal) => {
          if (ws.readyState === 1) {
            ws.send('\nSSH client has been closed\n');
            ws.close();
          }
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        }).on('data', (data) => {
          ws.send(data.toString());
        }).stderr.on('data', (data) => {
          ws.send(data.toString());
        });

      });
    })
    .on('error', (err) => {
      ws.send(err.toString());
    });
}

