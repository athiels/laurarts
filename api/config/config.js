const path = require('path');

module.exports = {
    photoHeight: 1080,
    photoQuality: 100,
    thumbnailHeight: 200,
    thumbnailQuality: 100,
    imageDir: path.dirname(require.main.filename) + '/public/img/uploads/',
    uploadDir: path.dirname(require.main.filename) + '/uploads'
}