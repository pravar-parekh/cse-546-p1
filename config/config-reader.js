const fs = require('fs')
const config = require("./configuration.json")


function getConfig () {
    try {
        const configString = fs.readFileSync("../config/configuration.json")
        const configuration = JSON.parse(configString)
        // console.log(configuration.AIM)
        return configuration;
    } catch (err) {
        console.log("Failed to get JSON string object", err);
        return null;
    }
}

module.exports = { getConfig }
