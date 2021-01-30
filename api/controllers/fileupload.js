var fs = require('fs');
const config = require("../config/config");

module.exports.upload = async function(file, fname, path) {
    return new Promise( async function(resolve, reject) {
        try {
            if (!file) return reject('No file uploaded');
            
            var filename = file.name;
            if (fname) filename = fname;

            var filePath = config.uploadDir + "/" + filename;
            if (path && fs.existsSync(path)) filePath = path + "/" + filename;

            file.mv(filePath, function() {
                return resolve(filePath);
            });
            
        } catch(err) { return reject(err); }
    });
}
