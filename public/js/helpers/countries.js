const countries = [
    { value: "BE", text: "België" },
    { value: "NL", text: "Nederland" },
    { value: "FR", text: "Frankrijk" },
    { value: "LU", text: "Luxemburg" },
    { value: "DE", text: "Duitsland" },
]

function getCountries() {
    return countries;
}

function getCountryName(code) {
    try { return countries.find(country => { return country.value == code }).text }
    catch(err) { return code };
}