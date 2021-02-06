function adminCreateInput(type, id, value, label, dataAttributes) {
    if (type == "date" && value) value = value.substr(0, value.indexOf('T'));
    if (value == undefined) value = "";
    dataAttr = "";
    if (dataAttributes) {
        for (var key in dataAttributes) {
            if (dataAttributes.hasOwnProperty(key)) {
                dataAttr += " data-" + key + "=" + dataAttributes[key];
            }
        }
    }
    return '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ':</label>' : '') + '<input type="' + type + '" id="' + id + '" value="' + value + '" ' + dataAttr + '></div>';
}

function adminCreateRequiredInput(type, id, value, label, dataAttributes) {
    if (type == "date" && value) value = value.substr(0, value.indexOf('T'));
    if (value == undefined) value = "";
    dataAttr = "";
    if (dataAttributes) {
        for (var key in dataAttributes) {
            if (dataAttributes.hasOwnProperty(key)) {
                dataAttr += " data-" + key + "=" + dataAttributes[key];
            }
        }
    }
    return '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ': *</label>' : '') + '<input type="' + type + '" id="' + id + '" value="' + value + '" ' + dataAttr + ' required></div>';
}

function adminCreateCheckbox(id, checked, label) {
    return '<div class="admin-checkbox"><div class="input"><input type="checkbox" id="' + id + '"' + (checked ? 'checked="checked"' : "") + '"></div>' + (label ? '<label for="' + id + '">' + label + '</label>' : '') + '</div>';
}

function adminCreateImageUpload(id, value, label) {
    var html = '<div class="admin-input"><label for="' + id + '">' + (label ? label : id) + ':</label>';
    html += '<input type="file" accept="image/*" id="temp_' + id + '">';
    html += (value ? '<img id="preview_' + id + '" src="' + value + '" class="admin-img sphere">' : '');
    html += '<input type="hidden" id="' + id + '" value="' + value + '">';

    $(document).on("change", "#temp_" + id, function () {
        getImageData("temp_" + id, data => {
            $("#" + id).val(data);
            $("#preview_" + id).attr('src', data);
        });
    });
    return html;
}

function adminCreateBigImageUpload(id, value, label) {
    var html = '<div class="admin-input"><label for="' + id + '">' + (label ? label : id) + ':</label>';
    html += '<input type="file" id="photo" accept="image/*">';
    html += (value ? '<img id="preview_' + id + '" src="' + value + '" class="admin-img sphere">' : '');
    html += '<input type="hidden" id="' + id + '" value="' + value + '">';
    html += '</div>';
    return html;
}

function adminCreateSelect(options, id, value, label) {
    var selectOptions = "";
    options.forEach(option => {
        var selected = (option.value == value) ? "selected" : "";
        selectOptions += '<option value="' + option.value + '" ' + selected + '>' + option.text + '</option>';
    });
    return '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ':</label>' : '') + '<select id="' + id + '">' + selectOptions + '</select></div>';
}

function adminCreateTextarea(id, value, label, maxlength) {
    content = (value) ? value.replace(/<br\s*\/?>/gi, '\n') : '';
    let html = '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ':</label>' : '') + '<textarea id="' + id + '" ' + (maxlength ? 'maxlength="' + maxlength + '"' : '') + '>' + content + '</textarea></div>';
    if (maxlength) html += '<div class="info">Maximum ' + maxlength + ' characters.</div>';
    return html;
}

function adminCreateRequiredTextarea(id, value, label, maxlength) {
    content = (value) ? value.replace(/<br\s*\/?>/gi, '\n') : '';
    let html = '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ':</label>' : '') + '<textarea id="' + id + '" ' + (maxlength ? 'maxlength="' + maxlength + '"' : '') + ' required>' + content + '</textarea></div>';
    if (maxlength) html += '<div class="info">Maximum ' + maxlength + ' characters.</div>';
    return html;
}

function adminCreateInfo(label, content, id) {
    return '<div class="admin-info">' + (label ? '<label>' + label + ':</label>' : '') + '<span id="' + id + '">' + content + '</span></div>';
}

function adminCreateTelephoneLink(tel) {
    return tel + ' <a href="tel:' + tel + '"><i class="fas fa-phone" title="Klik om te bellen"></i></a>';
}

function adminCreateRating(id, value, label) {
    return '<div class="admin-input">' + (label ? '<label for="' + id + '">' + label + ':</label>' : '') + '<div id="' + id + '" class="rating" data-rate-value="' + value + '"></div></div>';
}

function adminCreateButton(id, buttonText, label) {
    return '<div class="admin-input">' + (label ? '<label>' + label + ':</label>' : '') + '<button type="button" id="' + id + '">' + buttonText + '</button></div>';
}


function getImageData(id, cb) {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        return alert('The File APIs are not fully supported in this browser.');
    }

    input = document.getElementById(id);
    if (!input) return alert("Um, couldn't find the fileinput element.");
    else if (!input.files) return alert("This browser doesn't seem to support the `files` property of file inputs.");
    else if (!input.files[0]) return alert("Please select a file before clicking 'Load'");
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = function () {
            cb(fr.result);
        };
    }
}

var notif_counter = 0;
function addNotification(msg, status) {
    insertAdminHeader();
    var notif_id = "notif_" + notif_counter++;
    var notif = '<div id="' + notif_id + '" class="' + (status ? status : '') + '">';
    if (status && status == "success") notif += '<i class="fas fa-check"></i> ';
    if (status && status == "failed") notif += '<i class="fas fa-times"></i> ';
    notif += msg;
    $(".admin-notifications").append(notif);
    return notif_id;
}

function removeNotification(notif_id) {
    $(".admin-notifications #" + notif_id).remove();
}

function addActionButton(id, text, functionName) {
    insertAdminHeader();
    var html = '<button type="button" id="' + id + '">';
    html += getActionButtonIcon(id) + text + '</button>';
    $(".admin-header .right").append(html);

    $(document).on("click", "#" + id, function () { window[(functionName ? functionName : id)]() });
}

function addActionMenu(menuItems) {
    insertAdminHeader();
    let html = '<div class="action-menu-button">';
    html += '<i class="fas fa-ellipsis-v"></i>';
    html += '</div>';
    html += '<ul class="action-menu shadow">';
    menuItems.forEach(menuItem => {
        html += '<li id="' + menuItem.id + '">' + getActionButtonIcon(menuItem.id) +  menuItem.label + '</li>';
        $(document).on("click", "#" + menuItem.id, function () { window[(menuItem.functionName ? menuItem.functionName : menuItem.id)]() });
    });
    html += '</ul>';
    $(".admin-header .right").append(html);
}
$(document).on("click", ".action-menu-button", function() {
    $(".action-menu").toggle();
});
$(document).click(function(event) {
    if ($(event.target).closest('.action-menu-button').length == 0) $(".action-menu").hide();
});

function addActionSelect(id, options, functionName) {
    insertAdminHeader();
    var selectOptions = "";
    options.forEach(option => {
        selectOptions += '<option value="' + option.value + '">' + option.text + '</option>'
    });
    var html = '<select id="' + id + '">' + selectOptions + '</select>';
    $(".admin-header .right").append(html);

    $(document).on("change", "#" + id, function () { window[(functionName ? functionName : id)]() });
}

function insertAdminHeader() {
    if (!$(".admin-header").length) {
        $("#main_view").first().prepend('<div class="admin-header grid_12"><h4 id="main_view_title"></h4><h5 id="main_view_subtitle"></h5><div class="admin-notifications left"></div><div class="right"></div></div><div class="clear"></div>');
    }
}

function getActionButtonIcon(id) {
    if (id.toLowerCase().indexOf("Continue") > -1) return '<i class="fas fa-angle-right"></i> ';
    else if (id.toLowerCase().indexOf("save") > -1) return '<i class="fas fa-save"></i> ';
    else if (id.toLowerCase().indexOf("back") > -1) return '<i class="fas fa-angle-left"></i> ';
    else if (id.toLowerCase().indexOf("create") > -1) return '<i class="fas fa-plus"></i> ';
    else if (id.toLowerCase().indexOf("remove") > -1) return '<i class="fas fa-trash"></i> ';
    else if (id.toLowerCase().indexOf("receipt") > -1) return '<i class="fas fa-receipt"></i> ';
    else if (id.toLowerCase().indexOf("print") > -1) return '<i class="fas fa-print"></i> ';
    else if (id.toLowerCase().indexOf("invoice") > -1) return '<i class="fas fa-file-invoice"></i> ';
    else if (id.toLowerCase().indexOf("update") > -1) return '<i class="fas fa-pen"></i> ';
    else if (id.toLowerCase().indexOf("open") > -1) return '<i class="fas fa-external-link-alt"></i> ';
    else if (id.toLowerCase().indexOf("certificate") > -1) return '<i class="fas fa-file-contract"></i> ';
    else if (id.toLowerCase().indexOf("pdf") > -1) return '<i class="fas fa-file-pdf"></i> ';
    else return "";
}

function setMainTitle(title) {
    insertAdminHeader();
    $("#main_view_title").html(title);
}

function setSubTitle(title) {
    insertAdminHeader();
    $("#main_view_subtitle").html(title);
}

function back(keepParams) {
    if (window.history.back()) return;
    if (!keepParams) location.href = location.href.split("/").slice(0, -1).join("/");

    var newParams = "";
    if (keepParams) {
        newParams = "?";
        const params = new URLSearchParams(window.location.search);
        for (var key of params.keys()) {
            if (keepParams.includes(key)) newParams += key + "=" + params.get(key) + "&";
        }
    }
    var splitPath = location.href.split("/");
    splitPath.pop();
    backUrl = splitPath.join("/") + newParams;
    location.href = backUrl;
}

function confirm(title, msg, confirm, cancel) {
    $.confirm({
        //theme: 'dark',
        title: title,
        content: msg,
        buttons: {
            Ja: function () {
                if (confirm) confirm();
            },
            Nee: function () {
                if (cancel) cancel();
            }
        }
    });
}

function getAdminLang() {
    return $("#changeLang").val();
}

function getAtt(data, lang, attribute) {
    if (data && data[lang] && data[lang][attribute]) return data[lang][attribute];
    else return "";
}

function getAdminSection(url, level) {
    if (!url) url = window.location.pathname;
    if (!level) level = 0;
    var parts = url.split("/");
    parts.shift();
    parts.shift();
    if (parts[level]) return parts[level];
    return "";
}

function getUser() {
    try { return JSON.parse(getLocalStorage("user")); }
    catch { return false; }
}


$(document).ready(function() {
    $(document).keydown(function(event) {
      if (event.ctrlKey && event.keyCode == 83) {
        event.preventDefault();
        save();
      }
    });
});

function getUserPermission(permission) {
    if (!user) return false;
    if (!user.permissions) return false;
    if (user.permissions[permission]) return user.permissions[permission];
}