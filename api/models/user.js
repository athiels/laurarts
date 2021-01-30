var mongoose = require('mongoose');


var schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  fixed: {
    type: Object,
  },
  permissions: {
    type: Object,
  }
},{ timestamps: true });

var User = mongoose.model('User', schema);
module.exports = User;