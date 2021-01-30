var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  fixed: {
    type: Object
  },
  nl: {
    type: Object
  },
  fr: {
    type: Object
  },
  en: {
    type: Object
  },
},{ timestamps: true });

module.exports = mongoose.model('Review', schema);