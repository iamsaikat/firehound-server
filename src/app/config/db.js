var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://firehound:db4fire@ds259820.mlab.com:59820/firehound');

module.exports = {mongoose};
