const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');

module.exports.create = async function (body) {
    return new Promise(async function (resolve, reject) {
        var customer = new Customer();
        try { var id = await getNextId(); }
        catch (err) { console.log(err); return reject(err); }
        customer.id = id;
        customer.data = body;
        customer.data_string = JSON.stringify(body);
        customer.save(function (err, document) {
            if (err) { console.log(err); return reject(err); }
            return resolve(document);
        });
    });
};

module.exports.get = function (params) {
    return new Promise(async function (resolve, reject) {
        let query = {}, limit = 25;
        if (params && params.id) query._id = params.id;
        if (params && params._id) query._id = params._id;
        if (params && params.search) query.$text = { $search: params.search };
        if (params && params.limit) limit = parseInt(params.limit);
        
        let numberOfDocuments;
        try { numberOfDocuments = await Customer.countDocuments({}); }
        catch(err) { numberOfDocuments = "Aantal kon niet opgehaald worden."; }

        Customer.find(query).limit(limit).sort("-createdAt").exec(function (err, docs) {            
            if (err) return reject(err);
            let data = {
                docs: docs,
                numberOfDocuments: numberOfDocuments
            }
            return resolve(data);
        });
    });
};

module.exports.update = async function (body) {
    return new Promise(async function (resolve, reject) {
        Customer.findById(body._id, async function (err, customer) {
            if (err) return reject(err);
            if (!customer) return reject("Customer not found");
            customer.data = body;
            customer.data_string = JSON.stringify(body);
            customer.save(function (err, document) {
                if (err) return reject(err);
                return resolve(document);
            });
        });
    });
};

module.exports.delete = async function (obj) {
    return new Promise(async function (resolve, reject) {
        Customer.deleteOne({ _id: obj._id }, function (err, document) {
            if (err) return reject(err);
            return resolve(document);
        });
    });
};

function getNextId() {
    return new Promise(async function (resolve, reject) {
        Customer.findOne().sort({ createdAt: -1 }).limit(1).exec((err, document) => {
            if (err) return reject(err);
            if (!document) return resolve(1);
            // console.log(document);
            if (document) return resolve(document.id + 1);
        });
    });
}