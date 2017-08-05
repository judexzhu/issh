const passport = require('passport');
const da = require("../db/dataAccess");
const ssoda = require("../db/sso");
const LocalStrategy = require('passport-local').Strategy;
const SSOStrategy = require('./passport-sso');

passport.use(new LocalStrategy((username, password, done) => {
  da.findUserByName(username)
    .then((user) => {
      if (user && password !== user.password) {
        done(new Error('invalid password'), false);
      } else {
        done(null, user);
      }
    })
    .catch((err) => done(err, false));

}));

passport.use(new SSOStrategy((token, done) => {
  ssoda.getSSOUser(token)
    .then((user) => done(null, user))
    .catch((err) => done(err, false));
}));

passport.serializeUser((user, done) => {
  var data = {
    userName: user.userName,
    loginTime: Date.now()
  };
  return done(null, data);
});

passport.deserializeUser((user, done) => {
  return done(null, user);
});