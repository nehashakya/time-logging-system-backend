var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//Define a schema
var Schema = mongoose.Schema;

var workLogSchema = new Schema({
	titleOfWork : String,
    descriptionOfWork : String,
    noOfHours : Number,
    user : {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user'
    }
});

//Export function to create "user" model class
module.exports = mongoose.model('workLog', workLogSchema );