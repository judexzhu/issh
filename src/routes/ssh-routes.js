const ensureLoggedIn = require('../passport/ensureLoggedIn');
const userBiz = require('../biz/userBiz');
const passport = require('passport');

module.exports = (app) => {
  app.post('/api/user/login', passport.authenticate('local'), userBiz.login);
  app.post('/api/user/ssologin', passport.authenticate('sso'), userBiz.ssoLogin);
  app.get('/api/user', ensureLoggedIn, userBiz.getUserInfo);
  app.put('/api/user/servers', ensureLoggedIn, userBiz.updateUserServers);
  app.delete('/api/user/servers/:id', ensureLoggedIn, userBiz.removeUserServers);
  app.post('/api/user/register', userBiz.registerUser);
};