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
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  }
},{ timestamps: true });

module.exports = mongoose.model('Invoice', schema);