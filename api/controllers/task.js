const mongoose = require('mongoose');
const Task = mongoose.model('Task');

module.exports.create = async function(body) {
	return new Promise(async function(resolve, reject) {
        
        let task = new Task();
        task.data = JSON.parse(body.fixedData);
        task.data_string = JSON.stringify(task.data);

        task.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        var query = {};        
        if (params._id) query["_id"] = params._id;
        if (params && params.search) query["$text"] = { $search: params.search };

        Task.find(query).sort({createdAt: -1}).exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(body) {
    return new Promise(async function(resolve, reject) {

        Task.findById(body._id, async function(err, task) {
            if (err) return reject(err);
            if (!task) return reject("No task found");

            task.data = JSON.parse(body.fixedData);
            task.data_string = JSON.stringify(task);

            task.save(function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });	
        });	

    });
};

module.exports.delete = async function(obj) {
	return new Promise(async function(resolve, reject) {
        if (obj._id) {
            Task.deleteOne( {_id: obj._id}, function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });
        } else return reject("No ID found");
	});
};