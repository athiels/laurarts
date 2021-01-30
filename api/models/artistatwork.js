var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  fixed: {
    type: Object
  },
  avatar: {
    type: Object
  },
},{ timestamps: true });

module.exports = mongoose.model('ArtistAtWork', schema);