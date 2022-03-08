const { Mutex } = require("async-mutex");

imap = new Map()

const mutex = new Mutex()

let used_instances = 0;


function getUsedInstanceCount() {
    return new Promise((resolve, reject) => {
        mutex.acquire()
        .then(async (release) => {
            try {
                resolve(used_instances)
            }catch (e) {
                reject(-1);
            }finally {
                release();
            }
        })
   })   
}

function increaseUsedInstance(num) {
    return new Promise((resolve, reject) => {
        mutex.acquire()
        .then(async (release) => {
            try {
             used_instances += num;
             resolve(used_instances)
            }catch (e) {
                reject(-1);
            }finally {
                release();
            }
        })
   })

}
function decreaseUsedInstanceByOne() {
    return new Promise((resolve, reject) => {
        mutex.acquire()
        .then(async (release) => {
            try {
             used_instances -= 1;
             resolve(used_instances)
            }catch (e) {
                reject(-1);
            }finally {
                release();
            }
        })
   })

}

function removeInstanceId(instanceId) {
    
    return new Promise((resolve, reject) => {
        mutex.acquire()
        .then(async (release) => {
            try {
                imap.delete(instanceId)
                resolve()
            }catch (e) {
                reject(-1);
            }finally {
                release();
            }
        })
   })
}

//key: instanceId
//value: Data returned from AWS 
function addInstanceIdToMap(instanceId, data) {
 
    return new Promise((resolve, reject) => {
        mutex.acquire()
        .then(async (release) => {
            try {
                imap.set(instanceId, data)
            }catch (e){
                reject(-1);
            }finally {
                release();
            }
        })
   })
}

module.exports = { addInstanceIdToMap, getUsedInstanceCount, removeInstanceId, increaseUsedInstance, decreaseUsedInstanceByOne,  }


