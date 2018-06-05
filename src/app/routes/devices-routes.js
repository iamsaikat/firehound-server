const app = require('express');
const router = app.Router();
const request = require('request');
const apiUrl = 'https://api.firehound.org/api/';

module.exports = () => {
  router.use(function (req, res, next) {
    next();
  });

  router.route('/devices')
    .get(function (req, res) {
      request.get(apiUrl, function (error, response, body) {
        if (error) {
          res.send({
            error: "Couldn't get the devices.",
            error
          })
        } else {
          res.json({
            message: "Retrieved Devices",
            devices: JSON.parse(body)
          })
        }
      });
    })
    return router
}