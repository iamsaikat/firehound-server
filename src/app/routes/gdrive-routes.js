const app = require('express');
const router = app.Router();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var path = require("path");
var _ = require('lodash');

var {mongoose} = require('../config/db');
var {Device} = require('../models/device');


// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = 'credentials.json';

module.exports = () => {
  router.use(function (req, res, next) {
    next();
  });

  router.route('/gdrive-files')
    .get(function (req, res) {
      /**
       * Create an OAuth2 client with the given credentials, and then execute the
       * given callback function.
       * @param {Object} credentials The authorization client credentials.
       * @param {function} callback The callback to call with the authorized client.
       */
      function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getAccessToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });
      }

      /**
       * Get and store new token after prompting for user authorization, and then
       * execute the given callback with the authorized OAuth2 client.
       * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
       * @param {getEventsCallback} callback The callback for the authorized client.
       */
      function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) return callback(err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
          });
        });
      }

      /**
       * Lists the names and IDs of up to 10 files.
       * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
       */
      function listFiles(auth) {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
          'q': "'1UugE3Eb43arYnfn0muFvIkkDkbvj3NAr' in parents",
          fields: 'nextPageToken, files(id, name, size)',
        }, (err, {data}) => {
          if (err) return console.log('The API returned an error: ' + err);
          var files = data.files;
          if (files.length) {
            files.forEach(e => {
              var title = e.name.split("-").pop();
              const codename = title.split(".")[0];
              e.codename = codename;
              // Add files in MongoDB
              var device = new Device(e);

              Device.find({ id: e.id}).then((result) => {
                if (!result[0]) {
                  device.save().then((doc) => {
                    console.log(doc);
                  }, (e) => {
                    res.status(400).send(e);
                  });
                }
              });
            });

            Device.find().then((result) => {
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

              res.status(200).send("Successfully synced with gdrive files");

            }).catch((e) => {
              res.status(400).send();
            });
          } else {
            console.log('No files found.');
          }
        });
      }
      // Load client secrets from a local file.
      fs.readFile(path.join(__dirname, '../../..', 'client_secret.json'), (err, content) => {
        console.log(JSON.parse(content));
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), listFiles);
      });
    })
  return router
}