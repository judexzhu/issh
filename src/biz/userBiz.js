const da = require('../db/dataAccess');
const ssoda = require('../db/sso');

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
  var servers = req.body;
  var username = req.user.userName;

  da.updateUserServers({ userName: username, servers: servers })
    .then(() => res.sendStatus(200))
    .catch((err) => next(err));
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