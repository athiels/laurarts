var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  }
},{ timestamps: true });

module.exports = mongoose.model('NewsletterSubscription', schema);