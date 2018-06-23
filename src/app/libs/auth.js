var passport = require("passport")
var passportJWT = require("passport-jwt")
var User = require('../models/user')
var cfg = require("../../config.js")
var ExtractJwt = passportJWT.ExtractJwt
var Strategy = passportJWT.Strategy
var params = {
  secretOrKey: cfg.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
}

module.exports = function () {
  var strategy = new Strategy(params, function (payload, done) {
    if (payload.hasOwnProperty('id')) {
      User.findById(payload.id, function (err, user) {
        if (user) {
          return done(null, {
            id: user._id,
            name: user.name
          })
        } else {
          return done({
            error: new Error("User not found")
          }, null)
        }
      })
    } else {
      return done({
        error: new Error("Malformed Token")
      }, null)
    }
  })
  passport.use(strategy)
  return {
    initialize: function () {
      return passport.initialize()
    },
    authenticate: function () {
      return passport.authenticate("jwt", cfg.jwtSession)
    }
  }
}