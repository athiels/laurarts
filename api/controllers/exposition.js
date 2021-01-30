const mongoose = require('mongoose');
const Exposition = mongoose.model('Exposition');

const galleryitem = require ('./galleryitem');

module.exports.create = async function(body, uploadFiles) {
	return new Promise(async function(resolve, reject) {

        if (uploadFiles) {
            try { var avatar = await galleryitem.create(undefined, uploadFiles.file, true); }
            catch(err) { return reject(err); }
        }

        var exposition = new Exposition();
        var fixedData = JSON.parse(body.fixedData);
        var languageData = JSON.parse(body.languageData);        
        var lang = body.lang;
        exposition.fixed = fixedData;
        exposition[lang] = languageData;
        if (avatar) exposition.avatar = avatar;
        
        exposition.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(id) {
	return new Promise(async function(resolve, reject) {
        if (id) {
            Exposition.findById( id, function (err, docs) {
                if (err) return reject(err);
                return resolve(docs);  
            });
        } else {
            Exposition.find({}).sort( { 'fixed.startdate': 1 } ).exec(function (err, docs) {
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

            Exposition.findById(body._id, async function(err, exposition) {
                if (err) return reject(err);

                var lang = body.lang;
                exposition.fixed = JSON.parse(body.fixedData);
                exposition[lang] = JSON.parse(body.languageData);
                if (avatar) {
                    if (exposition.avatar) { 
                        // Remove existing avatar
                        try { await galleryitem.delete(exposition.avatar) }
                        catch(err) { return reject(err); }
                    }
                    exposition.avatar = avatar;
                }
            
                exposition.save(function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });		
            });
        } catch(err) { return reject(err); }
    });
};

module.exports.delete = function(obj) {
	return new Promise(async function(resolve, reject) {
        if (obj._id) {

            Exposition.findById(obj._id, async function(err, exposition) {
                if (err) return reject(err);

                if (exposition.avatar) { 
                    // Remove existing avatar
                    try { await galleryitem.delete(exposition.avatar) }
                    catch(err) { return reject(err); }
                }

                Exposition.deleteOne( {_id: obj._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        } else return reject("No ID found");
	});
};