const app = require('express');
const router = app.Router();
var bodyParser = require('body-parser');
var {User} = require('../models/user');
/**
 * Configure JWT
 */
var bcrypt = require('bcryptjs');
var {User} = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/auth-config'); // get config file

module.exports = () => {
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());
  router.use(function (req, res, next) {
    next();
  });

  router.route('/login')
    .post(function (req, res) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        
        // check if the password is valid
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    
        // if user is found and password is valid
        // create a token
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
    
        // return the information including token as JSON
        res.status(200).send({ auth: true, token: token });
      });
    })
    return router
}