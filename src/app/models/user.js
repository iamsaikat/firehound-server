var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

var UserSchema = new Schema({
  id:{
    type: Number,
    primaryKey: true,
    autoIncrement: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    index: { 
      unique: true 
    } 
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['editor', 'admin'],
    default: 'editor'
  }
}, {
  timestamps: true
})

UserSchema.pre('save', function(next) {
  var user = this
  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)

    //hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err)

        user.password = hash
        next()
    })
  })
})

module.exports = mongoose.model("User", UserSchema);
