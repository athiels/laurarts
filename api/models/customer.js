var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  data: {
    type: Object,
  },
  data_string: {
    type: String,
    text: true
  }
},{ timestamps: true });

module.exports = mongoose.model('Customer', schema);