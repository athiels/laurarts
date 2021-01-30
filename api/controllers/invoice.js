const mongoose = require('mongoose');
const Invoice = mongoose.model('Invoice');
const Order = mongoose.model('Order');

module.exports.create = async function(body) {
	return new Promise(async function(resolve, reject) {

        if (!body.order_id) return reject("Order ID not provided");

        try { 
            var data = await exports.get({order_id: body.order_id}); 
            if (data.length) return resolve(data[0]);
        } catch(err) { return reject(err); }

        var invoice = new Invoice();  
        try { var id = await getNextId(); }
        catch(err) { return reject(err); }
        invoice.id = id;
        invoice.number = new Date().getFullYear() + pad(id, 3);
        invoice.order = body.order_id;

        invoice.save(async function(err, invoiceDocument) {
            if (err) return reject(err);
            try {
                await Order.updateOne({ _id: invoice.order }, { invoiced: true });
                return resolve(invoiceDocument);
            } catch(err) { return reject(err); }
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        var query = {};
        if (params._id) query._id = params._id;
        if (params.order_id) query.order = params.order_id;
        let regex = new RegExp(params.search, 'i');
        if (params.search) query.$text = {$search: regex};
        Invoice.find(query).populate({ path: 'order', populate: { path: 'customer' } }).sort({createdAt: -1}).exec(async function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);
        });
	});
};


module.exports.delete = async function(obj) {
	return new Promise(async function(resolve, reject) {
        if (obj._id) {            
            Invoice.deleteOne( {_id: obj._id}, function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });
        } else return reject("No ID found");
	});
};

function getNextId() {
    return new Promise(async function(resolve, reject) {
        Invoice.findOne({}, {}, { sort: { 'createdAt' : -1 } }, function(err, document) {
            if (err) return reject(err);
            if (!document) return resolve(1);
            if (document) return resolve(document.id + 1);
          });
	});
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}