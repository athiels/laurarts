const order = require('./order');
const customer = require('./customer');
const artist = require('./artist');


let delivery_method = ["delivery_internal", "delivery_internal", "delivery_internal", "pickup"];
let delivery_method_timing = ["delivery_method_around", "delivery_method_specific", "delivery_method_contact_around"];


async function createDummyData() {
    let customers = await customer.get();
    let artists = await artist.get();
    // console.log("customers", customers.docs.length);
    // console.log("artists", artists.length);

    asyncForEach(customers.docs, async customer => {

        let total_price = Math.round(getRandomArbitrary(100, 250)) * 10;
        let advance = Math.round(getRandomArbitrary(10, 25)) * 10;
        let artist = getRandomElement(artists);
        let start = new Date(2020, 09, 1), end = new Date(2021, 09, 1), startHour = 0, endHour = 24;
        let salesdate = getRandomDate(start, end, startHour, endHour);
        let deliverydate = getRandomDate(salesdate, end, startHour, endHour);
        let width = Math.round(getRandomArbitrary(10, 15)) * 10;
        let height = Math.round(getRandomArbitrary(5, 10)) * 10;

        let formdata = {
            "salesdate": "2020-12-29T00:00:00.000Z",
            "total_price": total_price,
            "advance": advance, 
            "saldo": total_price - advance,
            "paid": false, 
            "delivery_method": getRandomElement(delivery_method), 
            "delivery_method_timing": getRandomElement(delivery_method_timing), 
            "deliverydate": deliverydate, 
            "info": "", 
            "delivery_ready": false, 
            "sales": "5daf433589730b6e90b48088", 
            "internal_info": "", 
            "artworks": [{ 
                "photo": "", 
                "artist": artist.fixed.name, 
                "description": "Een test kunstwerk", 
                "dimensions": width + ' x ' + height, 
                "price": total_price, 
                "commissioned": getRandomElement([false, false, false, false, true])
            }]
        }

        let data = {
            "file_0": "undefined",
            "customer_id": customer._id,
            "formdata": JSON.stringify(formdata)
        }

        try { let orderData = await order.create(data); console.log(orderData._id, "created"); }
        catch(err) { console.log(err); }
    });
}
// createDummyData();

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomElement(arr) {
	var x = Math.floor(Math.random() * arr.length);
	return arr[x];
}
function getRandomDate(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}



async function updateCountryCodes() {
    let customers = await customer.get();
    await asyncForEach(customers.docs, async customer => {
        
        formdata = customer.data;
        if (formdata.deliveryaddress && formdata.deliveryaddress.country) {
            formdata.deliveryaddress.country_code = formdata.deliveryaddress.country;

            customer.formdata = JSON.stringify(formdata);
            await customer.update(customer);
            console.log(customer._id, "geupdatet");
        }
    });
}
// updateCountryCodes();