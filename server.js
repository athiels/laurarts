const express = require('express');
const bodyParser = require('body-parser');
const boolParser = require('express-query-boolean');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const sslRedirect = require('heroku-ssl-redirect');

var models_path = './api/models'
fs.readdirSync(models_path).forEach(function (file) {
	if (~file.indexOf('.js')) require(models_path + '/' + file)
})

const app = express();
app.use(sslRedirect());
app.use(bodyParser.json());
app.use(boolParser());
app.use(cors());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('libraries'));
app.use(require('./routes'));

const port = process.env.PORT || 80; 
const server = app.listen(port, function() {
	console.log("App is listening on port "+port);
});
server.timeout = 1000 * 60 * 10; // 10 minutes

require("./api/controllers/dummydata");