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
  position: {
    type: Number
  },
  avatar: {
    type: Object
  },
},{ timestamps: true });

module.exports = mongoose.model('Gallery', schema);