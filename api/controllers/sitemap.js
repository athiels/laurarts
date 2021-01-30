const fs = require("fs");

const links = [
    "home",
    "artists",
    "artist/margrete-vanschoelant",
    "artist/tairou-bodian",
    "artist/jochem-de-graaf",
    "artist/dye-finch",
    "artist/henry-brand",
    "artist/twan-van-de-ven",
    "artist/nicolas-meeus",
    "artist/jan-kind",
    "artist/mondeli",
    "artist/clemy-roelandt",
    "galleries",
    "expositions",
    "about-us",
    "contact",
    "write-review",
    "newsletter/subscribe",
    "newsletter/unsubscribe"
];

module.exports.get = function() {
    return new Promise(async function(resolve, reject) {
        try {
            fs.readFile(`${process.cwd()}/public/sitemap.xml`, 'utf8', (err, data) => {
                if (err) throw err;
                return resolve(data);
            });
        } catch(err) { return reject(err); }
    });
}

module.exports.update = function() {
    return new Promise(async function(resolve, reject) {
        try {
            const now = new Date();
            let data = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;
            links.forEach(link => {
                data += `<url>\n\t<loc>https://galerijthiels.be/${link}</loc>\n\t<lastmod>${now.toISOString()}</lastmod>\n</url>\n`;
                data += `<url>\n\t<loc>https://www.galerijthiels.be/${link}</loc>\n\t<lastmod>${now.toISOString()}</lastmod>\n</url>\n`;
            });
            data += `</urlset>`;

            fs.writeFile(`${process.cwd()}/public/sitemap.xml`, data, (err) => {
                if (err) throw err;
                console.log(`${new Date().toISOString()} | Sitemap has been updated`);
                return resolve(true);
            });
        } catch(err) { return reject(err); }
    });
}