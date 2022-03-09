
var fs = require('fs');
const sqs_utility = require('./sqs-utility.js');

/* encode image */
function base64_encode(file, imageName, hostname) {
    // console.log(file)
    return imageName+","+fs.readFileSync(file, 'base64')+","+hostname;
}

async function processResponseQ() {
    try {
        return await sqs_utility.getMessageFromResponseQ();
    } catch (e) {
        console.log(e)
        return
    } 
}

module.exports = { base64_encode, processResponseQ };