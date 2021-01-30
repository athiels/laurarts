var mongoose = require( 'mongoose' );

var schema = new mongoose.Schema({
  artist_id: {
    type: String
  },
  photo: {
    link: {
      type: String
    },
    metadata: {
      type: Object
    }
  },
  thumbnail: {
    link: {
      type: String
    },
    metadata: {
      type: Object
    }
  },
  data: {
    type: Object
  },
  position: {
    type: Number
  },
},{ timestamps: true });

module.exports = mongoose.model('GalleryItem', schema);