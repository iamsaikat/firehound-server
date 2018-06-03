var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const port = process.env.PORT || 3000;
var app = express();

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n');
  next();
});


app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));


const apiUrl = 'https://api.firehound.org/api/';

app.get('/', (req, res) => {
  res.send('<h3>Welcome to Firehound Server</h3>');
});

app.get('/devices', (req, res) => {
  request.get(apiUrl, function (error, response, body) {
    res.send(JSON.parse(body));
  });

});

app.post('/download', function (req, res) {

  var cookieRequest = request.defaults({
    jar: true
  })

  var exportURL = "";
  if (req.body.id) {
      exportURL = "https://drive.google.com/uc?export=download&id=" + req.body.id;
  } else {
      exportURL = req.body.link;
  }
  
  cookieRequest.get({
      url: exportURL,
      followRedirect: false
    },
    function (error, response, body) {

      if (response.headers.location) {
        console.log(response.headers.location);
        // res.send(response.headers.location);
      }

      var dom = new JSDOM(body);

      var fileName = dom.window.document.querySelector(".uc-name-size a").textContent;

      var dlLink = "https://drive.google.com" + dom.window.document.querySelector("#uc-download-link").href;

      cookieRequest.get({
          url: dlLink,
          followRedirect: false
        },
        function (error, response, body) {
          console.log(response.headers.location);
          res.send({
            download_link: response.headers.location
          });
        });
    });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});