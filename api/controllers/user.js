var bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.create = async function(body) {
	return new Promise(async function(resolve, reject) {

        if (body.password != body.password_confirm) return reject("Passwords not the same.")

        var user = new User();   
        user.email = body.email;
        user.username = body.username;
        if (body.fixed) user.fixed = body.fixed;
        if (body.permissions) user.permissions = body.permissions;

        try { user.password = await encryptPassword(body.password); }
        catch(err) { return reject(err); }
    
        user.save(function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });	
	});
};

module.exports.get = function(params) {
	return new Promise(async function(resolve, reject) {
        if (!params) params = {};
        User.find(params).select('-password').exec(function (err, docs) {
            if (err) return reject(err);
            return resolve(docs);  
        });
	});
};

module.exports.update = async function(body) {
    return new Promise(async function(resolve, reject) {

        User.findById(body._id, async function(err, user) {
            if (err) return reject(err);

            user.email = body.email;
            user.username = body.username;
            if (body.fixed) user.fixed = body.fixed;
            if (body.permissions) user.permissions = body.permissions;

            if (body.password) {
                if (body.password != body.password_confirm) return reject("Passwords not the same.")
                try { user.password = await encryptPassword(body.password); }
                catch(err) { return reject(err); }
            }

            user.save(function(err, document) {
                if (err) return reject(err);
                return resolve(document);
            });		
        });

    });
};

module.exports.delete = async function(obj) {
	return new Promise(async function(resolve, reject) {
               
        User.deleteOne( {_id: obj._id}, function(err, document) {
            if (err) return reject(err);
            return resolve(document);
        });

	});
};

module.exports.authenticate = async function(login, password) {
    return new Promise(async function(resolve, reject) {

        User.findOne( { $or:[ {'email': login}, {'username': login} ] }, function (err, user) {
            if (err) return reject(err); 
            else if (!user) return reject("User not found")
            
            try { 
                if (bcryptjs.compareSync(password, user.password)) return resolve(user);
                return reject("Password incorrect");
            } catch(err) { return reject(err); }
        });
    });
}

async function encryptPassword(password) {
    return new Promise(async function(resolve, reject) {
        try {
            let hash = bcryptjs.hashSync(password, 10);
            return resolve(hash);
        } catch(err) { return reject(err);}
    });
}