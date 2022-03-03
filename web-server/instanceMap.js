imap = new Map()

function getCurrentInstanceCount() {
    return imap.size;
}

//key: instanceId
//value: Data returned from AWS 
function addInstanceIdToMap(instanceId, data) {
    imap.set(instanceId, data)
}

module.exports = { getCurrentInstanceCount, addInstanceIdToMap }


