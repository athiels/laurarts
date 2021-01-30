const sharp = require('sharp');
const mongoose = require('mongoose');
const ArtistAtWork = mongoose.model('ArtistAtWork');

const galleryitem = require ('./galleryitem');

module.exports.create = async function(body, uploadFiles) {
	return new Promise(async function(resolve, reject) {

        if (uploadFiles) {
            try { var avatar = await galleryitem.create(undefined, uploadFiles.file, true); }
            catch(err) { return reject(err); }
        }
        
        let artistAtWork = new ArtistAtWork();
        let fixedData = JSON.parse(body.fixedData);
        artistAtWork.fixed = fixedData;
        if (avatar) { artistAtWork.avatar = avatar }

        artistAtWork.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        if (params && params.id) {
            ArtistAtWork.findById( params.id, function (err, docs) {
                if (err) return reject(err);
                return resolve(docs);  
            });
        } else {
            ArtistAtWork.find({}, function (err, docs) {
                if (err) return reject(err);
                return resolve(docs);  
            });
        }
	});
};

module.exports.update = async function(body, uploadFiles) {
    return new Promise(async function(resolve, reject) {
        try {

            if (uploadFiles) {
                try { var avatar = await galleryitem.create(undefined, uploadFiles.file, true); }
                catch(err) { return reject(err); }
            }

            ArtistAtWork.findById(body._id, async function(err, artistAtWork) {
                if (err) return reject(err);
                
                let fixedData = JSON.parse(body.fixedData);
                artistAtWork.fixed = fixedData;
                if (avatar) { 
                    if (artistAtWork.avatar) {
                        // Remove existing avatar
                        try { await galleryitem.delete(artistAtWork.avatar) }
                        catch(err) { return reject(err); }
                    }
                    artistAtWork.avatar = avatar;
                }
                artistAtWork.save(function(err, document) {
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
            ArtistAtWork.findById( obj._id, async function(err, artistAtWork) {
                if (err) return reject(err);

                // Verwijder avatar
                if (artistAtWork.avatar) {
                    try { await galleryitem.delete(artistAtWork.avatar); }
                    catch(err) { return reject(err); }
                }

                ArtistAtWork.deleteOne( {_id: obj._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        } else return reject("No ID found");
	});
};

module.exports.count = async function() {
    return new Promise(async function(resolve, reject) {
        ArtistAtWork.countDocuments({}, function(err, count){
            if (err) return reject(err);
            return resolve(count);
        });
    });
}

module.exports.updatePositions = async function(list) {
    return new Promise(async function(resolve, reject) {
        try {
            await asyncForEach(list, artistAtWork => {
                try { updatePosition(artistAtWork.id, artistAtWork.position); }
                catch(err) { return reject(err); }
            });
        } catch(err) { return reject(err) }
        return resolve({"success": true});
    });
}

async function updatePosition(id, position) {
    return new Promise(async function(resolve, reject) {
        ArtistAtWork.updateOne({_id: id}, { position: position }, (err, docs) => {
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
    return Math.random() * (max - min) + min;
}