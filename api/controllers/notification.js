const schedule = require('node-schedule');
const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');

// Automatically delete acknowledged notifications that are older than 7 days
schedule.scheduleJob('00 06 * * * *', function() {
    removeAcknowledged();
});

module.exports.create = async function(body) {
	return new Promise(async function(resolve, reject) {

        if (!body.title || body.title == "") return reject("Title is required");
        if (!body.message || body.message == "") return reject("Message is required");

        let notification = new Notification();
        notification.title = body.title;
        notification.message = body.message;
        if (body.url) notification.url = body.url;
        notification.acknowledged = false;
        if (body.acknowledged) notification.acknowledged = body.acknowledged;
        if (body.relatedId) notification.relatedId = body.relatedId;
        
        notification.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        const pageSize = 40;
        const page = Math.max(params.page, 0);
        let query = {};
        if ("acknowledged" in params) query.acknowledged = params.acknowledged;
        if ("olderThan" in params) query.createdAt = { $lt: params.olderThan };
        Notification.find(query).sort("-createdAt").limit(pageSize).skip(pageSize * page).exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.acknowledge = async function(body) {
    return new Promise(async function(resolve, reject) {
        let query;
        if (body.ids) query = { _id: { $in: body.ids} };
        else if (body.relatedIds) query = { relatedId: { $in: body.relatedIds} };
        else return reject("Id array required");

        Notification.updateMany(query, { $set: { acknowledged: true }}, {new: true}, function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });
    });
};

module.exports.delete = function(obj) {
	return new Promise(async function(resolve, reject) {
        if (!obj.ids) return reject("No IDs found");
        try {
            let deleteManyData = await Notification.deleteMany({ _id: { $in: obj.ids } });
            return resolve(deleteManyData);
        } catch(err) { return reject(err); }
	});
};

async function removeAcknowledged() {
    try { 
        olderThanDate = new Date();
        olderThanDate.setDate(olderThanDate.getDate() - 7);
        const params = {
            acknowledged: true,
            olderThan: olderThanDate
        };
        let acknowledgedNotifications = await exports.get(params);
        acknowledgedNotificationsIds = acknowledgedNotifications.map(notification => { return notification._id });
        if (!acknowledgedNotificationsIds.length) return;

        let deleteManyData = await Notification.deleteMany({ _id: { $in: acknowledgedNotificationsIds } });
        console.log(`${new Date().toISOString()} | ${deleteManyData.deletedCount} notification(s) deleted`);

    } catch(err) { console.log(err); }
}