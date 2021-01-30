var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
    unique: true,
  },
  data: {
    type: Object,
  },
  data_string: {
    type: String,
    text: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }
},{ timestamps: true });

module.exports = mongoose.model('Presentation', schema);