const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const config = require("./api/config/config");

// CREATE CONFIG DIRS 
if (!fs.existsSync(config.imageDir)) { fs.mkdirSync(config.imageDir); }
if (!fs.existsSync(config.uploadDir)) { fs.mkdirSync(config.uploadDir); }

// API ROUTES


// GALLERY 
const gallery = require('./api/controllers/gallery');

router.get('/api/gallery', async (req, res) => {
	try {
		var data = await gallery.get(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/gallery/create', verifyToken, async (req, res) => {
	try {
		var data = await gallery.create(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/gallery/update', verifyToken, async (req, res) => {
	try {
		var data = await gallery.update(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/gallery/delete', verifyToken, async (req, res) => {
	try {
		var data = await gallery.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/gallery/update-positions', verifyToken, async (req, res) => {
	try {
		var data = await gallery.updatePositions(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});


// GALLERY 
const galleryitem = require('./api/controllers/galleryitem');

router.get('/api/galleryitem', async (req, res) => {
	try {
		var data = await galleryitem.get(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.get('/api/galleryitem/artworks', async (req, res) => {
	try {
		var data = await galleryitem.getArtworks(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/galleryitem/add', verifyToken, async (req, res) => {
	try {
		var data = await galleryitem.create(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/galleryitem/update', verifyToken, async (req, res) => {
	try {
		var data = await galleryitem.update(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/galleryitem/delete', verifyToken, async (req, res) => {
	try {
		var data = await galleryitem.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/galleryitem/update-positions', verifyToken, async (req, res) => {
	try {
		var data = await galleryitem.updatePositions(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});

// PHOTO
const photo = require('./api/controllers/photo');

router.get('/api/photo/status', verifyToken, async (req, res) => {
	try {
		var data = await photo.status();
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});

router.post('/api/photo/restore', verifyToken, async (req, res) => {
	try {
		var data = await photo.restore(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});

// URL REWRITES
const urlrewrite = require('./api/controllers/urlrewrite');
router.get('/api/urlrewrite', async (req, res) => {
	try {
		var params = {};
		if (req.query.id) params = { _id: req.query.id };
		var data = await urlrewrite.get(params);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/urlrewrite/create', verifyToken, async (req, res) => {
	try {
		var data = await urlrewrite.create(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/urlrewrite/update', verifyToken, async (req, res) => {
	try {
		var data = await urlrewrite.update(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/urlrewrite/delete', verifyToken, async (req, res) => {
	try {
		var data = await urlrewrite.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});



// DATABASE
const database = require('./database/database');
database.connectToServer(async function (err) {
	if (err) console.log(err);

	// Create Server Start Notification
	// try {
	// 	const notificationOptions = {
	// 		title: "Server opgestart",
	// 		message: "De webserver is zonet gestart (of herstart).",
	// 		acknowledged: true
	// 	}
	// 	await notification.create(notificationOptions);
	// } catch(err) { console.log(err); }

});

router.get('/api/admin/stats', verifyToken, async (req, res) => {
	try {
		const data = await database.stats();
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});


// SITEMAP
const sitemap = require('./api/controllers/sitemap');
router.get('/api/admin/sitemap', verifyToken, async (req, res) => {
	try {
		const data = await sitemap.get();
		return res.json(data).status(200);
	} catch (err) { return res.json(err.message).status(500); }
});
router.post('/api/admin/sitemap/update', async (req, res) => {
	try {
		const data = await sitemap.update();
		return res.json(data).status(200);
	} catch (err) { return res.json(err.message).status(500); }
});


// USERS
const user = require('./api/controllers/user');
router.get('/api/admin/user', async (req, res) => {
	try {
		var data = await user.get(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/admin/user/create', async (req, res) => {
	try {
		var data = await user.create(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/admin/user/update', async (req, res) => {
	try {
		var data = await user.update(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post('/api/admin/user/delete', async (req, res) => {
	try {
		var data = await user.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.json(err).status(500); }
});
router.post("/api/admin/user/login", async (req, res) => {
	if (req.body.password) {
		try {
			var loginUser = await user.authenticate(req.body.email, req.body.password);
			const token = generateJwt(loginUser);
			res.status(200).json({ "token": token, user: loginUser });
		} catch (err) { return res.status(403).end(); }
	} else if (req.body.token) {
		try {
			var decoded = jwt.verify(req.body.token, process.env.GT_ADMIN_PASSWORD);
			if (decoded.username == process.env.GT_ADMIN_USERNAME) res.status(200).json({ "token": req.body.token });
			else res.status(403).end(); // Forbidden
		} catch (err) { res.status(403).end(); } // Forbidden
	}
});

// SALES - CUSTOMERS
const customer = require('./api/controllers/customer');

router.get('/api/sales/customer', async (req, res) => {
	try {
		var data = await customer.get(req.query);
		return res.json(data).status(200);
	} catch (err) { console.log(err); return res.status(500).json(err); }
});
router.post('/api/sales/customer/create', verifyToken, async (req, res) => {
	try {
		var data = await customer.create(req.body);
		return res.json(data).status(200);
	} catch (err) { console.log(err); return res.status(500).json(err); }
});
router.post('/api/sales/customer/update', verifyToken, async (req, res) => {
	try {
		var data = await customer.update(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/sales/customer/delete', verifyToken, async (req, res) => {
	try {
		var data = await customer.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});


// SALES - ORDERS
const order = require('./api/controllers/order');

router.get('/api/sales/order', async (req, res) => {
	try {
		var data = await order.get(req.query);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/sales/order/create', verifyToken, async (req, res) => {
	try {
		var data = await order.create(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});
router.post('/api/sales/order/update', verifyToken, async (req, res) => {
	try {
		var data = await order.update(req.body, req.files);
		return res.json(data).status(200);
	} catch (err) { console.log(err); return res.status(500).json(err); }
});
router.post('/api/sales/order/delete', verifyToken, async (req, res) => {
	try {
		var data = await order.delete(req.body);
		return res.json(data).status(200);
	} catch (err) { return res.status(500).json(err); }
});



// VIEWS

// ADMIN
router.get('/view/admin/login', (req, res) => {
	res.sendFile(path.join(__dirname + `/public/html/admin/login.html`));
});
router.get('/view/admin/logout', (req, res) => {
	res.sendFile(path.join(__dirname + `/public/html/admin/logout.html`));
});
router.get('/view/admin/*', verifyToken, async (req, res) => {

	var url = req.originalUrl;
	var split = url.split("/");
	var pathString = "/public/html/admin";
	for (i = 3; i < split.length; i++) { pathString += "/" + split[i]; }
	pathString += ".html";

	var filePath = path.join(__dirname + pathString);
	if (fs.existsSync(filePath)) res.sendFile(filePath);
	else res.sendFile(path.join(__dirname + '/public/html/admin/404.html'));
});

router.get('/view/*', async (req, res) => {

	var url = req.originalUrl;
	var split = url.split("/");
	var lang = split[2];

	var pathString = "/public/html";
	for (i = 2; i < split.length; i++) { pathString += "/" + split[i]; }
	pathString += ".html";

	var filePath = path.join(__dirname + pathString);
	if (fs.existsSync(filePath)) {
		return res.sendFile(filePath);
	}

	else if (url.indexOf('id') > -1) {
		if (filePath = getFile(url)) return res.sendFile(filePath);
	} else {
		var requestedPath = "";
		for (i = 3; i < split.length; i++) {
			requestedPath += "/" + split[i];
		}

		try {
			var urlrewr = await urlrewrite.get({ new_url: requestedPath });
			if (!urlrewr.length) {
				return res.sendFile(path.join(__dirname + '/public/html/admin/404.html'));
			}
			if (filePath = getFile("/" + lang + urlrewr[0].original_url)) {
				var options = { headers: { 'x-urlrewrite': JSON.stringify(urlrewr) } };
				return res.sendFile(filePath, options);
			} else throw Error("File not found");
		} catch (err) { return res.sendFile(path.join(__dirname + '/public/html/admin/404.html')); }
	}
});


router.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/html/admin/index.html'));
});
router.get('/admin/*', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/html/admin/index.html'));
});

router.get('/', (req, res) => {
	res.redirect('/home');
});

router.get('/robots.txt', (req, res) => {
	res.sendFile(path.join(__dirname + '/robots.txt'));
});

router.get('*', (req, res) => {
	if (req.originalUrl.includes("webpages")) {
		return res.sendStatus(404); // Make sure Google doesn't find old URL's anymore
	}
	res.sendFile(path.join(__dirname + '/public/html/index.html'));
});


function getFile(url) {
	url = url.split("/view").pop();
	var pathString = "/public/html";
	if (url.indexOf('id') > -1) {
		var parts = url.split("/");
		for (i = 1; i < parts.length; i++) {
			if (parts[i] == 'id') break;
			pathString += "/" + parts[i];
		}
	} else { pathString += url; }

	pathString += ".html";
	var filePath = path.join(__dirname + pathString);
	if (fs.existsSync(filePath)) {
		return filePath;
	}
	return false;
}

function generateJwt(loginUser) {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 1);
	return jwt.sign({
		user: loginUser,
		exp: parseInt(expiry.getTime() / 1000),
	}, process.env.GT_ADMIN_PASSWORD);
};

async function verifyToken(req, res, next) {
	const auth_token = req.headers['authorization'];
	if (typeof auth_token !== 'undefined') {
		try {
			var decoded = jwt.verify(auth_token, process.env.GT_ADMIN_PASSWORD);
			try {
				var loginUser = await user.get({ _id: decoded.user._id });
				loginUser = loginUser[0];
				if (loginUser.fixed && loginUser.fixed.active == "true") next();
				else res.redirect('/view/admin/logout');
			} catch (err) { return res.sendStatus(403); }
		} catch (err) { res.sendStatus(403); }
	} else { res.sendStatus(403); }
}

module.exports = router;