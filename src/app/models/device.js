var mongoose = require('mongoose');

var Device = mongoose.model('Device', {
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  date: { 
    type: String, 
    default: new Date().toISOString() 
  },
  size: {
    type: Number,
    default: 0
  },
  codename: {
    type: String,
    required: true
  },
  download: {
    type: Number,
    default: 0
  }
});

module.exports = {Device};