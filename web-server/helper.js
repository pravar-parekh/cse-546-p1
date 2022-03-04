var fs = require('fs');
const sqs_utility = require('./sqs-utility.js');

/* encode image */
function base64_encode(file, type) {
    console.log(file)
    return "data:image/"+type+";base64,"+fs.readFileSync(file, 'base64');
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