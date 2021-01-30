const { query } = require('express');
const mongoose = require('mongoose');
const GalleryItem = mongoose.model('GalleryItem');

const photo = require("./photo");


module.exports.create = async function(body, uploadFiles, squareThumbnail) {
	return new Promise(async function(resolve, reject) {

        if (uploadFiles) {
            if (uploadFiles.file) var file = uploadFiles.file
            else var file = uploadFiles;
            
            try { var galleryPhoto = await photo.create(file, squareThumbnail);}
            catch(err) { return reject(err); }
        }

        try { var numberOfDocuments = await exports.count(); }
        catch(err) { return reject(err); }

        var galleryItem = new GalleryItem();
        // galleryItem.position = numberOfDocuments;
        galleryItem.position = numberOfDocuments * -1;

        try {
            var formdata = JSON.parse(body.formdata);
            galleryItem.data = formdata;
            galleryItem.artist_id = formdata.artist_id;
        } catch(err) {}; 
        
        if (galleryPhoto) {
            galleryItem.photo.link = galleryPhoto.photo._id;
            galleryItem.photo.metadata = galleryPhoto.photo.metadata;
            galleryItem.thumbnail.link = galleryPhoto.thumbnail._id;
            galleryItem.thumbnail.metadata = galleryPhoto.thumbnail.metadata;
        }
    
        galleryItem.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        let query = {};
        if (params) query = params;
        GalleryItem.find(query).sort('position').exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.getArtworks = function(params) {
	return new Promise(async function(resolve, reject) {
        let query = {}, limit = 1000;
        query["data.show"] = "true";
        query.artist_id = { $exists: true };        
        if (params.artist_id) query.artist_id = params.artist_id;
        if (params.limit) limit = parseInt(params.limit);
        
        GalleryItem.find(query).sort('-createdAt').limit(limit).exec(function (err, docs) {
            if (err) { console.log(err); return reject(err);} 
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(body, uploadFiles) {
    return new Promise(async function(resolve, reject) {
        try {

            if (uploadFiles) {
                try { var galleryPhoto = await photo.create(uploadFiles.file);}
                catch(err) { return reject(err); }
            }
    
            try { var numberOfDocuments = await exports.count(); }
            catch(err) { return reject(err); }

            var formdata;
            try { var formdata = JSON.parse(body.formdata);} 
            catch(err) { return reject(err); } 

    
            GalleryItem.findById(formdata._id, async function(err, data) {
                if (err) return reject(err);

                data.data = formdata;
                data.artist_id = formdata.artist_id;
                
                if (galleryPhoto) {
                    // Remove existing photos
                    if ((data.photo && data.photo.link) && (data.thumbnail && data.thumbnail.link)) {
                        try { await removePhotos(data); }
                        catch(err) { return reject(err); }
                    }

                    data.photo.link = galleryPhoto.photo._id;
                    data.photo.metadata = galleryPhoto.photo.metadata;
                    data.thumbnail.link = galleryPhoto.thumbnail._id;
                    data.thumbnail.metadata = galleryPhoto.thumbnail.metadata;
                }

                data.save(function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });		
            });
        } catch(err) { return reject(err); }
    });
};

module.exports.delete = function(obj) {
	return new Promise(async function(resolve, reject) {

        try {
            GalleryItem.findById(obj._id, async function (err, galleryItem) {
                if (err) return reject(err);

                if (galleryItem.photo.link && galleryItem.thumbnail.link) {
                    try { var success = await removePhotos(galleryItem); }
                    catch(err) { console.log(err); return reject(err); }
                }
                
                GalleryItem.deleteOne( {_id: galleryItem._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(true);
                });
            });
        } catch(err) { console.log(err); return reject(err); }
	});
};

async function removePhotos(galleryItem) {
    return new Promise(async function(resolve, reject) {
        try { await photo.delete(galleryItem.photo); }
        catch(err) { return reject(err); }
        try { await photo.delete(galleryItem.thumbnail); }
        catch(err) { return reject(err); }

        return resolve(true);
    });
}

module.exports.count = async function() {
    return new Promise(async function(resolve, reject) {
        GalleryItem.countDocuments({}, function(err, count){
            if (err) return reject(err);
            return resolve(count);
        });
    });
}

module.exports.updatePositions = async function(list) {
    return new Promise(async function(resolve, reject) {
        try {
            await asyncForEach(list, artist => {
                try { updatePosition(artist.id, artist.position); }
                catch(err) { return reject(err); }
            });
        } catch(err) { return reject(err) }
        return resolve({"success": true});
    });
}

async function updatePosition(id, position) {
    return new Promise(async function(resolve, reject) {
        GalleryItem.updateOne({_id: id}, { position: position }, (err, docs) => {
            if (err) return reject(err);
            return resolve(docs);
        });
    });
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}