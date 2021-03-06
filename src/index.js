var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

const request = require('request');
const port = process.env.PORT || 3000;

const devicesRoutes = require('./app/routes/devices-routes');
const downloadRoutes = require('./app/routes/download-routes');
const gdriveRoutes = require('./app/routes/gdrive-routes');
const userRoutes = require('./app/routes/user-routes');
const AuthRoutes = require('./app/routes/auth-routes');

app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.get("/", function (req, res) {
  res.json({
    status: "Firehound API is live and running!"
  })
})

//Devices Routes...
app.use('/api', devicesRoutes());

//Download Routes...
app.use('/api', downloadRoutes());

//User Routes...
app.use('/api', userRoutes());

//Login Routes...
app.use('/api', AuthRoutes());

//Get gdrive files Routes...
app.use('/api', gdriveRoutes());

app.listen(port, () => {
  console.log(`Api running on http://localhost:${port}/api`);
});

module.exports = app