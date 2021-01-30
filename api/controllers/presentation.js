const mongoose = require('mongoose');
const Presentation = mongoose.model('Presentation');
const customer = require("./customer");

const galleryitem = require ('./galleryitem');

module.exports.create = async function(body, uploadFiles) {
	return new Promise(async function(resolve, reject) {
        
        var presentation = new Presentation();
        currentYear = new Date().getFullYear();
        try { 
            var id = await getNextId(); 
            var idThisYear = await getNextId(currentYear); 
        } catch(err) { return reject(err); }
        presentation.id = id;
        presentation.number = currentYear + pad(idThisYear, 3);
        presentation.data = JSON.parse(body.formdata);
        presentation.customer = body.customer_id;
        try { let customerData = await customer.get({_id: body.customer_id}); presentation.customer = customerData.docs[0]}
        catch(err) { console.log(err); }
        
        presentation.data_string = JSON.stringify(presentation);

        if (uploadFiles) {
            for (i=0; i<presentation.data.artworks.length; i++) {
                try { 
                    var photo = await galleryitem.create(undefined, uploadFiles["file_" + i]); 
                    presentation.data.artworks[i].photo = photo;
                } catch(err) { return reject(err); }
            }
        }       

        presentation.save(function(err, document) {
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
        if (params.enddate) query["data.delivery_date"] = { $lt: params.enddate };
        if (params.startdate) query["data.delivery_date"] = { $gte: params.startdate };
        if (params && params.search) query["$text"] = { $search: params.search };
        
        Presentation.find(query).populate('customer').sort({createdAt: -1}).exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(body, uploadFiles) {
    return new Promise(async function(resolve, reject) {

        Presentation.findById(body._id, async function(err, presentation) {
            if (err) return reject(err);
            if (!presentation) return reject("No Id found");

            var data = JSON.parse(body.formdata);
        
            if (!uploadFiles) {
                data.artworks.forEach( (artwork, i) => {
                    artwork.photo = presentation.data.artworks[i].photo;
                });
            } else {
                console.log("Uploadfiles");
                await asyncForEach(data.artworks, async (artwork, i) => {
                    if (uploadFiles["file_" + i]) {
                        if (presentation.data.artworks[i].photo) {
                            // Remove existing photo
                            try { await galleryitem.delete(presentation.data.artworks[i].photo) }
                            catch(err) { return reject(err); }
                        }
                        // Save new photo
                        try {
                            var photo = await galleryitem.create(undefined, uploadFiles["file_" + i]); 
                            data.artworks[i].photo = photo;
                        } catch(err) { return reject(err); }
                    } else {
                        artwork.photo = presentation.data.artworks[i].photo;
                    }                
                });
            }

            let presentationId = presentation.id;
            let presentationNumber = presentation.number;
            
            presentation.data = data;
            presentation.id = presentationId;
            presentation.number = presentationNumber;
            presentation.customer = body.customer_id;
            try { let customerData = await customer.get({_id: body.customer_id}); presentation.customer = customerData.docs[0]}
            catch(err) { console.log(err); }
            
            presentation.data_string = JSON.stringify(presentation);

            presentation.save(function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });	
        });	

    });
};

module.exports.delete = async function(obj) {
	return new Promise(async function(resolve, reject) {
        if (obj._id) {
            Presentation.findById( obj._id, async function(err, presentation) {
                if (err) return reject(err);

                await asyncForEach(presentation.data.artworks, async (artwork, i) => {
                    if (presentation.data.artworks[i].photo) {
                        // Remove existing photo
                        try { await galleryitem.delete(presentation.data.artworks[i].photo) }
                        catch(err) { return reject(err); }
                    }
                });

                Presentation.deleteOne( {_id: obj._id}, function(err, document) {
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

        Presentation.findOne(query).sort('-createdAt').exec(function(err, document) {
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