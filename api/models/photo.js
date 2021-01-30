var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  buffer: {
    type: Buffer
  },
  metadata: {
    type: Object
  }
},{ timestamps: true });

module.exports = mongoose.model('Photo', schema);