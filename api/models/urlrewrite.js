var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  new_url: {
    type: String,
    required: true
  }
},{ timestamps: true });

module.exports = mongoose.model('Urlrewrite', schema);