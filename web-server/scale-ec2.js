// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// const { param } = require('express/lib/request');
const { getConfig } = require('../config/config-reader');
const { ec2_create } = require('./create-ec2');
const { getCurrentInstanceCount, getUsedInstanceCount, increaseUsedInstance } = require('./instanceMap');
const { getAttribute } = require('./sqs-utility');
const config = getConfig()
// Set the region 
AWS.config.update({region: 'us-east-1'});



//consts
const SQS_REQUEST_URL = config.SQS_REQUEST_URL
const MAX_INSTANCES = 8 //free trial limit - "1 for webserver"

//vars
let instanceMap = new Map();


async function getReqQueueStat() {
    try {
    
    let params = {
        QueueUrl: SQS_REQUEST_URL,
        AttributeNames : ['ApproximateNumberOfMessages'],
    };

    return await getAttribute(params);
    } catch (e) {
        console.log(e)
        return e;
    }  
}


/*
One image processing barely take 2 seconds.
We have 200 imaages. That is 1000 seconds ~= 17 minutes
Our target is to finish the total tests within 5 to 10 minutes max
If target is 5 minutes => we need to spin 3 servers for the job. But we do have 19 instances at our disposal. 
We can do 19 servers = 12 images per server which should consume 12 * 2 = 24 seconds for the total job + boot time
If there is more load, the ratio is good enough to trigger the scale early

*/
async function findNumberOfInstancesToStart(numberOfMessages) {
    
    getUsedInstanceCount().
    then(used_instances => {
        console.log("findNum used instances " + used_instances);
        console.log("used_instances " + used_instances);

        if (used_instances < 0)  //precaution
            return 0;
        
        let disposal = MAX_INSTANCES - used_instances;

        console.log("used " + used_instances + " disposal " + disposal)
        console.log("number of messages " + numberOfMessages)

        let instancesRequired = Math.round(numberOfMessages/2) //TODO: change it to some config value later. To be changed to 12
        if (instancesRequired == 0)
            instancesRequired = 1
        
        let totalInstancesRequired = Math.min(disposal,instancesRequired);
        if (totalInstancesRequired + used_instances)
        console.log("Total instance that would be run : " + totalInstancesRequired)
            increaseUsedInstance(totalInstancesRequired).then (() => {
                launch_instances(totalInstancesRequired)
            }) .catch ( e => {
                reject(e)
            })
        
        
        }).catch(e => {
            reject(e)
        })
}

async function launch_instances(num) {
    console.log("Received request to launach total instances = " + num)
    try {
        for (i = 0; i < num; ++i) {
           await ec2_create(i); // no need to make it await here. Will make the whole thing synchronous
        }
    } catch (err) {
        console.log("Error in launching instance")
        return null;
    }
}

function scale_up () {
    console.log("scale up is called")
    // get the number of messages in the request queue
    return new Promise ((resolve, reject) => {
        getReqQueueStat().then ((data) => {
                                    // console.log(data);
                            return data.Attributes.ApproximateNumberOfMessages
                       }).then( data => {
                             console.log("number of items in queue data : " + data)
                             findNumberOfInstancesToStart(data)
                             resolve()
                       }).catch (e => {
                            console.log("Error in scale up logic \n" + e)
                            reject("Scale failed")
                       })
    })
}


// console.log(SQS_REQUEST_URL)

// scale_up()
// console.log("Scaling done")

module.exports = { scale_up, instanceMap }