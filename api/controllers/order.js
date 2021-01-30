const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const customer = require("./customer");

const galleryitem = require ('./galleryitem');

module.exports.create = async function(body, uploadFiles) {
	return new Promise(async function(resolve, reject) {
        
        var order = new Order();
        currentYear = new Date().getFullYear();
        try { 
            var id = await getNextId(); 
            var idThisYear = await getNextId(currentYear); 
        } catch(err) { return reject(err); }
        order.id = id;
        order.number = currentYear + pad(idThisYear, 3);
        order.data = JSON.parse(body.formdata);
        order.customer = body.customer_id;
        try { let customerData = await customer.get({_id: body.customer_id}); order.customer = customerData.docs[0]}
        catch(err) { console.log(err); }
        
        order.invoiced = false;
        order.data_string = JSON.stringify(order);

        if (uploadFiles) {
            for (i=0; i<order.data.artworks.length; i++) {
                try { 
                    var photo = await galleryitem.create(undefined, uploadFiles["file_" + i]); 
                    order.data.artworks[i].photo = photo;
                } catch(err) { return reject(err); }
            }
        }       

        order.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        var query = {};        
        if (params._id) query["_id"] = params._id;
        if (params.customer_id) query["customer"] = params.customer_id;        
        if (params && params.search) query["$text"] = { $search: params.search };
        if (params.current) query["data.delivery_ready"] = false;
        if (params.archive) query["data.delivery_ready"] = true;

        Order.find(query).populate('customer').sort({createdAt: -1}).exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(body, uploadFiles) {
    return new Promise(async function(resolve, reject) {

        Order.findById(body._id, async function(err, order) {
            if (err) return reject(err);
            if (!order) return reject("No Id found");

            let data = JSON.parse(body.formdata);
        
            if (!uploadFiles) {
                data.artworks.forEach( (artwork, i) => {
                    artwork.photo = order.data.artworks[i].photo;
                });
            } else {
                await asyncForEach(data.artworks, async (artwork, i) => {                
                    if (uploadFiles["file_" + i]) {
                        if (order.data.artworks[i].photo) {
                            // Remove existing photo
                            try { await galleryitem.delete(order.data.artworks[i].photo) }
                            catch(err) { return reject(err); }
                        }
                        // Save new photo
                        try {
                            var photo = await galleryitem.create(undefined, uploadFiles["file_" + i]); 
                            data.artworks[i].photo = photo;
                        } catch(err) { return reject(err); }
                    } else {
                        artwork.photo = order.data.artworks[i].photo;
                    }                
                });
            }

            let orderId = order.id;
            let orderNumber = order.number;
            
            order.data = data;
            order.id = orderId;
            order.number = orderNumber;
            order.customer = body.customer_id;
            try { let customerData = await customer.get({_id: body.customer_id}); order.customer = customerData.docs[0]}
            catch(err) { console.log(err); }

            order.data_string = JSON.stringify(order);

            order.save(function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });	
        });	

    });
};

module.exports.delete = async function(obj) {
	return new Promise(async function(resolve, reject) {
        if (obj._id) {
            Order.findById( obj._id, async function(err, order) {
                if (err) return reject(err);

                await asyncForEach(order.data.artworks, async (artwork, i) => {
                    if (order.data.artworks[i].photo) {
                        // Remove existing photo
                        try { await galleryitem.delete(order.data.artworks[i].photo) }
                        catch(err) { return reject(err); }
                    }
                });

                Order.deleteOne( {_id: obj._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        } else return reject("No ID found");
	});
};

function getNextId(year) {
    return new Promise(async function(resolve, reject) {
        let query = {};
        if (year) query = { "createdAt": { "$gte": new Date(year, 0, 1), "$lt": new Date(year+1, 0, 1) }};

        Order.findOne(query).sort('-createdAt').exec(function(err, document) {
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