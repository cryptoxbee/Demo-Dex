const fs = require("fs");

const path = ("./data.json");

//yazdır
function writeData(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
//oku
function readData() {
    return JSON.parse(fs.readFileSync(path));
}

module.exports = { writeData, readData };