var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true, // no two users can create two same emails
    required: true,
    trim: true // removes whitespace accidentally
  },
  name: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: false
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = {User};