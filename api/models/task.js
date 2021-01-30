var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  data: {
    type: Object,
  },
  data_string: {
    type: String,
    text: true
  },
},{ timestamps: true });

module.exports = mongoose.model('Task', schema);