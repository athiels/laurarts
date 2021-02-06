const mongoose = require('mongoose');

var _db;
const dbURI = 'mongodb+srv://dbUser:Jt3nwtChIZzdv3Y0@cluster0.yj9ne.mongodb.net/production?retryWrites=true&w=majority';
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true, autoReconnect: true, useFindAndModify: false }

var db = mongoose.connection;

console.log("DB");

db.on('connecting', function() {
	console.log('connecting to MongoDB...');
});
db.on('error', function(error) {
	console.error('Error in MongoDb connection: ' + error);
  	mongoose.disconnect();
});
db.on('connected', function() {
  	console.log('MongoDB connected!');
});
db.once('open', function() {
  	console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
  	console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
  	console.log('MongoDB disconnected!');
  	exports.connectToServer();
});

module.exports.connectToServer = function( cb ) {
	mongoose.connect(dbURI, dbOptions, function( err, thisdb ) {
		console.log("Connected to MongoDB");
		_db = thisdb;
		if (cb) return cb( err );
	});
}

module.exports.getDb = function() {
	return _db;
}

module.exports.stats = function() {
	return new Promise(async function(resolve, reject) {

		if (! _db) return reject("Database not loaded");
		
		_db.db.stats(function(err, stats) {
			if (err) return reject(err);
			stats.maxSize = 536870912;
			return resolve(stats);
		});

	});
}

