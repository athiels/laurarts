const fs = require('fs');
const sharp = require('sharp');
const mongoose = require('mongoose');
const Photo = mongoose.model('Photo');

const fileupload = require("./fileupload");
const config = require("../config/config");

module.exports.create = async function(uploadFile, squareThumbnail) {
	return new Promise(async function(resolve, reject) {

        try { var filePath = await fileupload.upload(uploadFile); } 
        catch(err) { return reject(err); }

        try { var photo = await savePhoto(filePath, false, squareThumbnail); }
        catch(err) { return reject(err); }
       
        try { var thumbnail = await savePhoto(filePath, true, squareThumbnail); }
        catch(err) { return reject(err); }

        fs.unlink(filePath, (err) => {
            if (err) console.log(err);
        });
        
        return resolve({
            photo: photo,
            thumbnail: thumbnail
        });
	});
};

async function savePhoto(filePath, thumbnail, square) {
    return new Promise(async function(resolve, reject) {

        var photoHeight = thumbnail ? config.thumbnailHeight : config.photoHeight;
        var photoQuality = thumbnail ? config.thumbnailQuality : config.photoQuality;

        try { var originalMetadata = await sharp(filePath).metadata(); } 
        catch(err) { return reject(err); }

        var originalWidth = originalMetadata.width;
        var originalHeight = originalMetadata.height;
        var cropTop = 0, cropLeft = 0, cropWidth = originalWidth, cropHeight = originalHeight;

        if (square) {
            if ( originalWidth > originalHeight) {
                cropLeft = Math.round((originalWidth - originalHeight) / 2);
                cropWidth = originalHeight;
                cropHeight = originalHeight;
            } else {
                cropTop = Math.round((originalHeight - originalWidth) / 2);
                cropWidth = originalWidth;
                cropHeight = originalWidth;            
            }
        }

        // Reduce filesize
        try {
            var reducedFileBuffer = await sharp(filePath)
                .flatten( {background: {r: 255, g: 255, b: 255, alpha: 1}} )
                .extract( {top: cropTop, left: cropLeft, width: cropWidth, height: cropHeight })                
                .rotate()
                .resize({ width: null, height: photoHeight })
                .webp( { quality: photoQuality } )
                .toFormat('jpeg')
                .toBuffer();
        } catch(err) { console.log("Sharp error"); console.log(err); return reject(err); }

        try { var metadata = await sharp(reducedFileBuffer).metadata(); } 
        catch(err) { return reject(err); }

        var photo = new Photo();
        photo.metadata = metadata;
        photo.buffer = reducedFileBuffer;
        photo.save(function(err, document) {
            if (err) return reject(err);

            fs.writeFile(`${config.imageDir}${document._id}.${metadata.format}`, reducedFileBuffer, err => {
                if (err) { return reject(err); }
                return resolve(document);
            });
        });	
	});
}

module.exports.get = function(query) {
	return new Promise(async function(resolve, reject) {
        Photo.find( query ? query : {} , function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(obj) {
    return new Promise(async function(resolve, reject) {
        try {
            Photo.findById(obj._id, function(err, data) {
                if (err) return reject(err);
                data.metadata = obj;
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
        var id = (obj.link || obj._id);
        if (id) {
            Photo.deleteOne( { _id: id }, function(err, document) {
                if (err) return reject(err);

                var filePath = `${config.imageDir}${id}.${obj.metadata.format}`;
                if (filePath && fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) return reject(err);
                    });
                }
                return resolve(document);
            });
        } else return reject("No ID found");
	});
};

module.exports.status = async function() {
	return new Promise(async function(resolve, reject) {
        Photo.find( {} ).select('metadata.format').exec(async function (err, photos) {
            if (err) return reject(err);

            var result = {
                length: photos.length,
                existing: Array(),
                notFound: Array(),
            }

            await asyncForEach(photos, async photo => {
                try { 
                    await fileExistsAsync(`${config.imageDir}${photo._id}.${photo.metadata.format}`);
                    return result.existing.push(photo._id);
                } catch(err) { 
                    return result.notFound.push({ _id: photo._id });
                }
            });
            return resolve(result);  
        });
	});
};

module.exports.restore = async function() {
	return new Promise(async function(resolve, reject) {
        
        console.log(new Date().toISOString() + " | Start restoring photos");

        var result = {                
            success: Array(),
            failed: Array(),
        }

        let status;
        try { status = await exports.status(); }
        catch(err) { return reject(err); }

        await asyncForEach(status.notFound, async id => {
            try { 
                let restorePhotoData = await restorePhoto(id);
                result.success.push(restorePhotoData);
            } catch(err) {
                result.failed.push(err);
            }
        });

        console.log(`${new Date().toISOString()} | Photos restored: ${result.success.length} with success - ${result.failed.length} failed`);

        return resolve(result);
	});
};

async function restorePhoto(id) {
    return new Promise(async function(resolve, reject) {
        Photo.findById(id , async function (err, photo) {
            if (err) return reject(err);

            try { 
                await writeFileAsync(`${config.imageDir}${photo._id}.${photo.metadata.format}`, photo.buffer);
                return resolve(photo._id);
            } catch(err) { console.log(err); return reject({ _id: photo._id, err: err }); }
        });
    });
}

async function autoRestore() {
    try { var status = await exports.status(); }
    catch(err) { return err; }

    if (status.length == status.existing.length) return;

    console.log(`${new Date().toISOString()} | Photo autorestore: ${status.length - status.existing.length} / ${status.length} need to be restored.`);

    try { var status = await exports.restore(); }
    catch(err) { return err; }
}
autoRestore();

async function fileExistsAsync(path) {
    return new Promise(async function(resolve, reject) {
        fs.access(path, fs.F_OK, (err) => {
            if (err) return reject(err);
            return resolve(path);
        });
    });
}

async function writeFileAsync(path, data) {
    return new Promise(async function(resolve, reject) {
        fs.writeFile(path, data, err => {
            if (err) return reject(err);
            return resolve();
        }); 
    });
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}