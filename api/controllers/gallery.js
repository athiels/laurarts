const sharp = require('sharp');
const mongoose = require('mongoose');
const Gallery = mongoose.model('Gallery');

const galleryitem = require ('./galleryitem');

module.exports.create = async function(body, uploadFiles) {
	return new Promise(async function(resolve, reject) {

        if (uploadFiles) {
            try { var avatar = await galleryitem.create(undefined, uploadFiles.file, false); }
            catch(err) { return reject(err); }
        }
        
        try { var numberOfDocuments = await exports.count(); }
        catch(err) { return reject(err); }

        var gallery = new Gallery();
        var fixedData = JSON.parse(body.fixedData);
        fixedData.custom_url = "/gallery/" + fixedData.name.toLowerCase().replace(/ /g, '-');
        fixedData.custom_url_active = "false";
        gallery.fixed = fixedData;
        gallery.position = numberOfDocuments;
        if (avatar) { gallery.avatar = avatar }

        gallery.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        if (params && params.id) {
            Gallery.findById( params.id, function (err, docs) {
                if (err) return reject(err);
                return resolve(docs);  
            });
        } else {
            let query = {}, limit = 1000, skip = 0;

            if (params && params.random) query["fixed.show"] = "true";

            Gallery.countDocuments(query).exec(function (err, count) {
                if (err) return reject(err);
                if (params && params.limit) limit = parseInt(params.limit);
                if (params && params.random) {
                    skip = getRandomArbitrary(0, count);
                    query["fixed.show"] = "true";
                }
                
                Gallery.find(query).limit(limit).skip(skip).sort('position').exec(function (err, docs) {
                    if (err) return reject(err);
                    return resolve(docs);  
                });
            });
        }
	});
};

module.exports.update = async function(body, uploadFiles) {
    return new Promise(async function(resolve, reject) {
        try {

            if (uploadFiles) {
                try { var avatar = await galleryitem.create(undefined, uploadFiles.file, false); }
                catch(err) { return reject(err); }
            }
            Gallery.findById(body._id, async function(err, gallery) {
                if (err) return reject(err);
                var fixedData = JSON.parse(body.fixedData);
                fixedData.custom_url = "/gallery/" + fixedData.name.toLowerCase().replace(/ /g, '-');
                gallery.fixed = fixedData;
                if (avatar) { 
                    if (gallery.avatar) {
                        // Remove existing avatar
                        try { await galleryitem.delete(gallery.avatar) }
                        catch(err) { return reject(err); }
                    }
                    gallery.avatar = avatar;
                }
                gallery.save(function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });		
            });
        } catch(err) { return reject(err); }
    });
};

module.exports.delete = function(obj) {
	return new Promise(async function(resolve, reject) {
               
        try { var galleryItems = await galleryitem.get( {artist_id: obj._id} ); }
        catch(err) { return reject(err); }

        if (galleryItems.length) return reject("Galerij van deze artiest is niet leeg.");

        if (obj._id) {
            Gallery.findById( obj._id, async function(err, gallery) {
                if (err) return reject(err);

                // Verwijder avatar
                if (gallery.avatar) {
                    try { await galleryitem.delete(gallery.avatar); }
                    catch(err) { return reject(err); }
                }

                Gallery.deleteOne( {_id: obj._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        } else return reject("No ID found");
	});
};

module.exports.count = async function() {
    return new Promise(async function(resolve, reject) {
        Gallery.countDocuments({}, function(err, count){
            if (err) return reject(err);
            return resolve(count);
        });
    });
}

module.exports.updatePositions = async function(list) {
    return new Promise(async function(resolve, reject) {
        try {
            await asyncForEach(list, gallery => {
                try { updatePosition(gallery.id, gallery.position); }
                catch(err) { return reject(err); }
            });
        } catch(err) { return reject(err) }
        return resolve({"success": true});
    });
}

async function updatePosition(id, position) {
    return new Promise(async function(resolve, reject) {
        Gallery.updateOne({_id: id}, { position: position }, (err, docs) => {
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

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}