
/* encode image */
function base64_encode(file, type) {
    return "data:image/"+type+";base64,"+fs.readFileSync(file, 'base64');
}

module.exports = { base64_encode };