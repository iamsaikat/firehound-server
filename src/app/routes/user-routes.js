const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require("../libs/auth.js")();
const cfg = require("../../config.js");
const bcrypt = require('bcrypt');

var {mongoose} = require('../libs/db')

module.exports = () => {
  router.use(function (req, res, next) {
    next();
  })

  router.route('/users')
    .all(auth.authenticate())
    .post(function (req, res) {
      var user = new User()
      user.name = req.body.name
      user.email = req.body.email
      user.role = req.body.role
      user.password = req.body.password

      user.save(function (err) {
        if (err)
          res.send({
            error: "Couldn't save the user.",
            err
          })

        res.json({
          message: "This saves a new user.",
          data: user,
          url: req.url
        })
      })
    })
    .get(function (req, res) {
      User.find(function (err, users) {
        if (err) {
          res.send({
            error: "Couldn't get the users.",
            err
          })
        } else {
          res.json({
            message: "Retrieved Users",
            users: users
          })
        }
      })
    })

  router.route('/users/:user_id')
    .all(auth.authenticate())
    .get(function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          res.json({
            message: "Retrieved User",
            user: user
          })
        }
      })
    })
    .put(function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        if (err) {
          res.json(err)
        } else {
          if (user) {
            var password = req.body.old_password
            if (req.body.hasOwnProperty('name')) {
              user.name = req.body.name
            }
            if (req.body.hasOwnProperty('old_password')) {
              if (!bcrypt.compareSync(password, user.password)) {
                res.status(406).json({
                  message: 'Incorrct old password!'
                })
                return
              }
              if (req.body.hasOwnProperty('new_password') && req.body.hasOwnProperty('confirm_password')) {
                if (req.body.new_password == req.body.confirm_password) {
                  user.password = req.body.new_password
                  user.save((err) => {
                    if (err) {
                      res.status(406).json({
                        error: err
                      })
                    } else {
                      res.status(201).json({
                        message: 'User Updated!'
                      })
                    }
                  })
                } else {
                  res.status(406).json({
                    message: 'Passwords do not match!'
                  })
                }
              } else {
                res.status(406).json({
                  message: 'Please confirm new password!'
                })
              }
            } else {
              res.status(406).json({
                message: 'Please provide old password!'
              })
            }

          } else {
            res.json({
              message: 'User not found.'
            })
          }
        }
      })
    })
    .delete(function (req, res) {
      User.remove({
        _id: req.params.user_id
      }, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          res.json({
            message: "User Deleted!"
          })
        }
      })
    })
  return router
}