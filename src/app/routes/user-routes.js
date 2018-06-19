var app = require('express');
var router = app.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('../config/verify-token');

/**
 * Configure JWT
 */
var bcrypt = require('bcryptjs');
var {User} = require('../models/user');

module.exports = () => {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(function (req, res, next) {
    next();
  });

  // CREATES A NEW USER
  router.route('/user').post(function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      },
      function (err, user) {
        if (err) return res.status(500).send("There was a problem adding the information to the database.");
        res.status(200).send(user);
      });
  });


  // RETURNS ALL THE USERS IN THE DATABASE
  router.route('/user').get(function (req, res) {
    User.find({}, function (err, users) {
      if (err) return res.status(500).send("There was a problem finding the users.");
      res.status(200).send(users);
    });
  });

  // GETS A SINGLE USER FROM THE DATABASE
  router.route('/user/:id').get(function (req, res) {
    User.findById(req.params.id, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");
      res.status(200).send(user);
    });
  });

  // DELETES A USER FROM THE DATABASE
  router.route('/user/:id').delete(function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.status(200).send("User: " + user.name + " was deleted.");
    });
  });

  // UPDATES A SINGLE USER IN THE DATABASE
  // Added VerifyToken middleware to make sure only an authenticated user can put to this route
  router.route('/user/:id').put(VerifyToken, function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }, function (err, user) {
      if (err) return res.status(500).send("There was a problem updating the user.");
      res.status(200).send(user);
    });
  });

  return router;
}