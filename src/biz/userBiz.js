const da = require('../db/dataAccess');
const ssoda = require('../db/sso');
const _ = require('lodash');

exports.login = (req, res, next) => {
  res.json(req.user);
}

exports.ssoLogin = (req, res, next) => {
  handleSSOLogin(req.user)
    .then((user) => res.json(user))
    .catch((error) => next(error));
}

let handleSSOLogin = async (newUser) => {
  var user = await da.findUserByName(newUser.userName);
  if (!user) {
    await da.insertUser(newUser)
    return newUser;
  } else {
    return user;
  }

}

exports.getUserInfo = (req, res, next) => {
  da.findUserByName(req.user.userName)
    .then((result) => res.json(result))
    .catch((error) => next(error));
}

exports.updateUserServers = (req, res, next) => {
  var server = req.body;
  var userName = req.user.userName;
  ensureServerId(server);

  updateServers(userName, server._id, server)
    .then(() => res.sendStatus(202))
    .catch((err) => next(err));
}

exports.removeUserServers = (req, res, next) => {
  var serverId = req.params.id;
  var userName = req.user.userName;

  updateServers(userName, serverId)
    .then(() => res.sendStatus(202))
    .catch((err) => next(err));
}

let updateServers = async (userName, serverId, newServer) => {
  var user = await da.findUserByName(userName);
  user.servers = user.servers || [];
  _.remove(user.servers, (s) => s._id === serverId);
  if (newServer) {
    user.servers.push(newServer);
    user.servers = _.sortBy(user.servers, ['group', 'displayName']);
  }
  await da.updateUserServers(userName, user.servers);
}

let ensureServerId = (server) => {
  server._id = server._id || `${server.user}@${server.ip}`;
  server.displayName = server.displayName || server._id;
}

exports.registerUser = (req, res, next) => {
  var user = req.body;
  if (!user.userName || !user.password || !user.displayName || !user.email) {
    var error = new Error('Missing parameters');
    error.statusCode = 404;
    next(error);
    return;
  }

  handleRegister(user)
    .then(() => res.sendStatus(202))
    .catch((error) => next(error));
}

let handleRegister = async (user) => {
  let result = await da.findUserByName(user.userName);
  if (result) {
    throw new Error('user name exists');
  }

  await da.insertUser(user);

}