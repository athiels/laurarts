function load(section, template, cb) {
	if (template.charAt(0) == '/') template = template.substring(1, template.length);
	$.ajax({
		url: '/view/' + getLocalStorage("language") + '/' + template,
		type: "GET",
		beforeSend: function (xhr) { xhr.setRequestHeader('authorization', getLocalStorage("token")); },
		success: function (html, textStatus, jqXHR) {
			if (jqXHR.getResponseHeader('x-urlrewrite') && html.indexOf('var urlrewrite;') > -1) {
				html = html.replace('var urlrewrite;', 'var urlrewrite = ' + jqXHR.getResponseHeader('x-urlrewrite') + ';');
			}
			$("#" + section).html(html);
			if (cb) cb();
		},
		error: function () { console.log("error"); }
	});
}

function adminLoad(section, template, failedCb) {
	if (template.charAt(0) == '/') template = template.substring(1, template.length);
	if (template.charAt(template.length - 1) == '/') template = template.substring(0, template.length - 1);
	template = template.replace("admin/", "");

	getData(
		'/view/admin/' + template,
		function (data) {
			if (data.logout) return logOut();

			$("#" + section).html(data);
		},
		function () {
			console.log('Error loading /view/admin/' + template);
			if (failedCb) failedCb();
		}
	);
}

function adminLoadModal(template, params) {
	if (template.charAt(0) == '/') template = template.substring(1, template.length);
	if (template.charAt(template.length - 1) == '/') template = template.substring(0, template.length - 1);
	template = template.replace("admin/", "");

	// $(".modal").remove();
	// let html = '<div class="modal"';
	// if (params) {
	// 	Object.keys(params).forEach(key => {
	// 		html += ' data-' + key + '=' + params[key];
	// 	});
	// }
	// html += '></div>';
	if (params) {
		Object.keys(params).forEach(key => {
			$(".modal").data(key, params[key]);
		});
	}

	getData(
		'/view/admin/' + template,
		function (data) {
			if (data.logout) return logOut();
			$(".modal").html(data).modal();
		},
		function () {
			console.log('Error loading /view/admin/' + template);
			if (failedCb) failedCb();
		}
	);
}

function getData(url, success, failed) {
	$.ajax({
		url: url,
		type: 'GET',
		beforeSend: function (xhr) { xhr.setRequestHeader('authorization', getLocalStorage("token")); }
	})
		.done(function (data) {
			if (success) success(data);
		})
		.fail(function (xhr, status, error) {
			if (failed) failed(error);
		});
}

function postData(url, jsonData, success, failed) {
	$.ajax({
		url: url,
		type: 'POST',
		data: JSON.stringify(jsonData),
		contentType: "application/json",
		dataType: 'json',
		beforeSend: function (xhr) { xhr.setRequestHeader('authorization', getLocalStorage("token")); }
	})
		.done(function (data) {
			if (success) success(data);
		})
		.fail(function (xhr, status, error) {
			if (failed) failed(xhr.responseJSON);
		});
}

function setLocalStorage(key, value) {
	localStorage.setItem(key, value);
}
function getLocalStorage(key) {
	return localStorage.getItem(key);
}
function deleteLocalStorage(key) {
	localStorage.removeItem(key);
}

function formatDate(dateString) {
	date = new Date(dateString);
	return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
}
function formatDateTime(dateString) {
	date = new Date(dateString);
	return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
}

function formatPrice(price) {
	price = parseFloat(price);
	price = price.toFixed(2);
	price = price.replace(".", ",");
	return "€ " + price.replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
}

var originalMainHeight;

function setMainHeight() {
	if (!originalMainHeight) originalMainHeight = $("#main").height();

	var windowHeight = $(window).height();
	var headerHeight = $("#header").outerHeight(true);
	var mainHeight = $("#main").outerHeight(true);
	var footerHeight = $("#footer").outerHeight(true);
	var heightDifference = windowHeight - (headerHeight + mainHeight + footerHeight);

	// if (heightDifference > 0) $("#main").height($("#main").height() + heightDifference );
	// else $("#main").height(originalMainHeight);
}

function validateForm() {
	formOk = true;
	$("[required]").each(function () {
		if ($(this).val() == "") {
			formOk = false;
			$(this).addClass("required-value");
		}
		else if ($(this).attr("type") == "email" && !validateEmail($(this).val())) {
			formOk = false;
			$(this).addClass("required-value");
		}
		else $(this).removeClass("required-value");
	});
	return formOk;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function getFormData(formId, cb) {
	try {
		var data = {};
		$("#" + formId + " input, #" + formId + " textarea, #" + formId + " select, #" + formId + " .rating").each(function () {
			if ($(this).attr('type') == "date") {
				var date = new Date($(this).val());
				data[$(this).attr('id')] = date.toISOString();
			}
			else if ($(this).prop("tagName") == "TEXTAREA") {
				data[$(this).attr('id')] = $(this).val().replace(/(?:\r\n|\r|\n)/g, '<br />');
			}
			else if ($(this).attr('type') == "checkbox") {
				data[$(this).attr('id')] = $(this).prop('checked');
			}			
			else if ($(this).attr('class') && $(this).attr('class').includes("rating")) {
				data[$(this).attr('id')] = ($(this).data('rate-value') != undefined ? $(this).data('rate-value') : 0);
			}
			else data[$(this).attr('id')] = $(this).val();
		});

		return data;
	} catch (err) { if (cb) cb(err); }
}

function getUrlParam(name) {
	var url = new URL(window.location.href);
	var param = url.searchParams.get(name);
	return (param ? param : "");
}

function getUrlSection(name, url) {
	if (!url) url = window.location.href;
	var parts = url.split("/");
	for (i = 0; i < parts.length; i++) {
		if (parts[i] == name) return parts[i + 1];
	}
	return false;
}

function imageBufferToBas64(buffer) {
	var base64Flag = 'data:image/jpeg;base64,';
	var binary = '';
	var bytes = [].slice.call(new Uint8Array(buffer));
	bytes.forEach((b) => binary += String.fromCharCode(b));
	return base64Flag + window.btoa(binary);
}

function getImageFilename(image) {
	return image.link + "." + image.metadata.format;
}

function logOut() {
	setLocalStorage("token", "");
	location.href = "/admin";
}

function similarity(s1, s2) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
		if (i == 0)
			costs[j] = j;
		else {
			if (j > 0) {
			var newValue = costs[j - 1];
			if (s1.charAt(i - 1) != s2.charAt(j - 1))
				newValue = Math.min(Math.min(newValue, lastValue),
				costs[j]) + 1;
			costs[j - 1] = lastValue;
			lastValue = newValue;
			}
		}
		}
		if (i > 0)
		costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

function getRandom(arr, n) {
	let result = new Array(n);
	let len = arr.length;
	if (n > len) n = len;
	let taken = new Array(len);
	
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

function setDocumentTitle(title) {
	document.title = "Laurarts - " + (title ? ' - ' + title : '');
}

function setMetaTag(tag, content) {
	document.querySelector('meta[name="'+tag+'"]').setAttribute("content", content);
}

function enableForm(formId) {
	$("#" + formId + " input, #" + formId + " textarea, #" + formId + " select").attr("disabled", false);
}
function disableForm(formId) {
	$("#" + formId + " input, #" + formId + " textarea, #" + formId + " select").attr("disabled", true);
}
function enableButton(id) {
	$("#" + id).attr("disabled", false);
}
function disableButton(id) {
	$("#" + id).attr("disabled", true);
}

function replaceAll(string, find, replace) {
	const reg = new RegExp(find, 'g');
	return string.replace(reg, replace);
}

function groupBy(collection, property) {
    if (!collection || !collection.length) return "No items in collection";
    if (property && !(property in collection[0])) return "Property not found";
    if (!property) return collection;

    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        // if (property == "delivery_date") val = val.substr(0, val.indexOf('T'));
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
}