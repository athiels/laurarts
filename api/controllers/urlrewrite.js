const mongoose = require('mongoose');
const Urlrewrite = mongoose.model('Urlrewrite');

module.exports.create = async function(obj) {
	return new Promise(async function(resolve, reject) {

        var urlrewrite = new Urlrewrite();
        for (var key in obj){
            if (obj.hasOwnProperty(key)) {
                urlrewrite[key] = obj[key];
            }
        }
        urlrewrite.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        var query = {};
        if (params) query = params;
        Urlrewrite.find(query, function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(obj) {
    return new Promise(async function(resolve, reject) {
        try {
            Urlrewrite.findById(obj._id, function(err, data) {
                if (err) return reject(err);
                for (var key in obj){
                    if (obj.hasOwnProperty(key)) {
                        data[key] = obj[key];
                    }
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
        if (obj._id) {
            Urlrewrite.deleteOne( {_id: obj._id}, function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });
        } else return reject("No ID found");
	});
};