const app = require('express');
const router = app.Router();
const request = require('request');
const jsdom = require("jsdom");
const {
  JSDOM
} = jsdom;

var {mongoose} = require('../libs/db');
var {Device} = require('../models/device');

module.exports = () => {
  router.use(function (req, res, next) {
    next();
  });

  router.route('/download')
    .post(function (req, res) {
      var cookieRequest = request.defaults({
        jar: true
      })

      var exportURL = "";
      if (req.body.id) {
        exportURL = "https://drive.google.com/uc?export=download&id=" + req.body.id;
        Device.update({ id: req.body.id }, { $inc : { download : 1 }}).exec();
      } else {
        exportURL = req.body.link;
      }

      cookieRequest.get({
          url: exportURL,
          followRedirect: false
        },
        function (error, response, body) {
          if (error) {
            res.send({
              error: "Couldn't get the download link.",
              error
            })
          } else {
            if (response.headers.location) {
              console.log(response.headers.location);
            }

            var dom = new JSDOM(body);

            var fileName = dom.window.document.querySelector(".uc-name-size a").textContent;

            var dlLink = "https://drive.google.com" + dom.window.document.querySelector("#uc-download-link").href;

            cookieRequest.get({
              url: dlLink,
              followRedirect: false
            },
            function (error, response, body) {
              if (error) {
                res.send({
                  error: "Couldn't get the download link.",
                  error
                })
              } else {
                console.log(response.headers.location);
                res.send({
                  download_link: response.headers.location
                });
              }
            });
          }
        });
    })
  return router
}