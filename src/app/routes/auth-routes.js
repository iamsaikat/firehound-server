const express = require('express')
const router = express.Router()
const Users = require('../models/user')
const auth = require("../libs/auth")()
const jwt = require("jwt-simple")
const cfg = require("../../config.js")
const bcrypt = require('bcrypt')

var {mongoose} = require('../libs/db')

module.exports = () => {
  router.use((req, res, next) => {
    next()
  })

  router.post("/login", (req, res) => {
    if (req.body.email && req.body.password) {
      var email = req.body.email
      var password = req.body.password

      Users.findOne({
          email: email
        })
        .then(user => {
          if (bcrypt.compareSync(password, user.password)) {
            var payload = {
              id: user._id
            }
            var token = jwt.encode(payload, cfg.jwtSecret)
            res.json({
              token: token,
              id: user._id,
              role: user.role,
              'message': 'Token created!'
            })
          } else {
            res.sendStatus(401)
          }
        })
        .catch(error => res.sendStatus(401))
    } else {
      res.sendStatus(401)
    }
  })

  router.get("/logout", auth.authenticate(), (req, res) => {
    req.logout()
    res.redirect('/')
  })

  return router
}