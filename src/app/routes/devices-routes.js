const app = require('express');
const router = app.Router();
var _ = require('lodash');

var {mongoose} = require('../config/db');
var {Device} = require('../models/device');

module.exports = () => {
  router.use(function (req, res, next) {
    next();
  });

  router.route('/devices')
    .get(function (req, res) {
      Device.find({}, null, {sort: {codename: 1}}).then((result) => {
        // res.send(result);
        const data = _(result)
        .groupBy('codename') // group the items
        .map((group, codename) => ({ // map the groups to new objects
          codename,
          files: group.map(({ id, name, size, download }) => ({ // extract the dates from the groups
            id,
            name, 
            size,
            download
          }))
        }))
        .value();

        res.json({
          message: "Retrieved Devices",
          devices: data
        })
      });
    })
    return router
}