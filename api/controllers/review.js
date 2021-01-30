const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const sendgrid = require('./sendgrid');
const { newReviewEmailNotificationRecipient } = require("../config/config");
const notification = require('./notification');

module.exports.create = async function(body) {
	return new Promise(async function(resolve, reject) {

        let review = new Review();
        let fixedData = JSON.parse(body.fixedData);
        let languageData = JSON.parse(body.languageData);
        
        // save original title and text
        languageData.originalTitle = languageData.title;
        languageData.originalReviewText = languageData.reviewText;

        let lang = body.lang;
        if (fixedData.reviewed == undefined) { // Coming in from frontend
            fixedData.reviewed = false;
            fixedData.accepted = false;

            // Create notification
            try {
                const notificationOptions = {
                    title: "Nieuwe review verwerken",
                    message: languageData.title,
                    url: "https://galerijthiels.be/admin/cms/reviews/update?id=" + review._id,
                    relatedId: review._id
                }
                await notification.create(notificationOptions);
            } catch(err) { return reject(err); }

            // Send email notification
            try { 
                const mailOptions = {
                    recipients: [{"email": newReviewEmailNotificationRecipient}],
                    subject: "Review toegevoegd - " +  review._id
                };
                const templateOptions = {
                    template: "new-review",
                    substitution: {
                    title: languageData.title,
                    text: languageData.reviewText,
                    url: "https://galerijthiels.be/admin/cms/reviews/update?id=" + review._id
                    }
                };             
                await sendgrid.sendTemplateMail(mailOptions, templateOptions); 
            } catch(err) { return reject(err); }
        }
        review.fixed = fixedData;
        review[lang] = languageData;
        
        review.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        if (params.id) {
            Review.findById( params.id, function (err, docs) {
                if (err) return reject(err);
                return resolve(docs);  
            });
        } else {

            let query = {}, maxReviewsOnFrontend = 5, skip = 0, limit = 1000;

            if (params.artist) {
                let search = params.artist.split("-").join(" ");
                query["fixed.artist"] = new RegExp(search, 'i')
            }
            if (params.limit) {
                limit = maxReviewsOnFrontend; 
                query["fixed.accepted"] = "true";
            }

            Review.estimatedDocumentCount(query).exec(function (err, count) {
                if (err) return reject(err);
                
                if (params.random) skip = getRandomArbitrary(0, count - Math.min([maxReviewsOnFrontend, count - maxReviewsOnFrontend]));

                Review.find(query).limit(limit).skip(skip).sort("-createdAt").exec(function (err, docs) {
                    if (err) return reject(err);
                    return resolve(docs);  
                });
            });
        }
	});
};

module.exports.update = async function(body) {
    return new Promise(async function(resolve, reject) {
        try {
            Review.findById(body._id, async function(err, review) {
                if (err) return reject(err);

                var lang = body.lang;
                review.fixed = JSON.parse(body.fixedData);
                review[lang] = JSON.parse(body.languageData);            
                review.save(function(err, document) {
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

            Review.findById(obj._id, async function(err, review) {
                if (err) return reject(err);

                Review.deleteOne( {_id: obj._id}, function(err, document) {
                    if (err) return reject(err);
                    return resolve(document);
                });
            });
        } else return reject("No ID found");
	});
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}