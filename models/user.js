var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username : String,
    password : String,
    firstname : String,
    lastname : String,
    workLog : {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'workLog'
    }
});


// Execute before each user.save() call
userSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});


userSchema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) {
      console.log("message: error__" + err);
      return callback(err);
    }
    console.log("message:" + isMatch);
    callback(null, isMatch);
  });
};

//Export function to create "user" model class
module.exports = mongoose.model('user', userSchema );