const passport = require('passport-strategy');
const util = require('util');

class Strategy {
  constructor(verify) {
    passport.Strategy.call(this);
    this.name = 'sso';
    this._verify = verify;
  }

  authenticate(req, options) {
    options = options || {};
    var token = req.body.token;

    if (!token) {
      return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    }

    var self = this;

    function verified(err, user, info) {
      if (err) { return self.error(err); }
      if (!user) { return self.fail(info); }
      self.success(user, info);
    }

    try {
      this._verify(token, verified);
    } catch (ex) {
      return self.error(ex);
    }
  }
}

util.inherits(Strategy, passport.Strategy);

module.exports = Strategy;