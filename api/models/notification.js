var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  title: {
    type: String
  },
  message: {
    type: String
  },
  url: {
    type: String
  },
  acknowledged: {
    type: Boolean
  },
  relatedId: {
    type: String
  },
},{ timestamps: true });

module.exports = mongoose.model('Notification', schema);