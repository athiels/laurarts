const mongoose = require('mongoose');
const NewsletterSubscription = mongoose.model('NewsletterSubscription');

const sendgrid = require('./sendgrid');
const notification = require('./notification');

module.exports.getSubscriptions = function(params) {
	return new Promise(async function(resolve, reject) {

        let query = {};
        if (params && params.email) query.email = params.email;
        NewsletterSubscription.find(query).sort("-createdAt").exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
    });
};

module.exports.subscribe = async function(body) {
	return new Promise(async function(resolve, reject) {

        if (!body.name && !body.email) return reject("Please provide name and email.");

        // Check already subscribed
        try { 
            let subscription = await exports.getSubscriptions({email: body.email});
            if (subscription.length) return resolve("Already subscribed");
        } catch(err) { return reject(err); }

        let subscription = new NewsletterSubscription();
        subscription.name = body.name;
        subscription.email = body.email;
        
        // // Create notification
        // try {
        //     const notificationOptions = {
        //         title: "Nieuwe review verwerken",
        //         message: languageData.title,
        //         url: "https://galerijthiels.be/admin/cms/reviews/update?id=" + review._id,
        //         relatedId: review._id
        //     }
        //     await notification.create(notificationOptions);
        // } catch(err) { return reject(err); }


        // Send email notification
        try { 
            const mailOptions = {
                from: {
                    "email": "nieuwsbrief@galerijthiels.be",
                    "name": "Galerij Thiels"
                },
                recipients: [{"email": subscription.email}],
                subject: "Galerij Thiels - Aangemeld voor nieuwsbrief"
            };
            const templateOptions = {
                template: "newsletter-subscription-welcome",
                substitution: {
                    name: subscription.name,
                    email: subscription.email
                }
            };             
            await sendgrid.sendTemplateMail(mailOptions, templateOptions); 
        } catch(err) { return reject(err); }
        
        subscription.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.unsubscribe = function(body) {
	return new Promise(async function(resolve, reject) {
        const id = body._id;
        const email = body.email;
        if (!id && !email) return reject("ID or email not provided");
        
        const query = (email ? {email: email} : { _id: id} );

        NewsletterSubscription.deleteOne(query, function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });
	});
};