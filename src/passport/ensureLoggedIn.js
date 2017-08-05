module.exports = (req, res, next)=> {
  if ((req.isAuthenticated != null) && req.isAuthenticated()) {
    return next();
  } else {
    var error = new Error('Please login first');
    error.statusCode = 401;
    next(error);
  }
};