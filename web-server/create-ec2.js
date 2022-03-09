// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const { getConfig } = require('../config/config-reader');
const { addInstanceIdToMap, getUsedInstanceCount, printInstanceMap } = require('./instanceMap');

AWS.config.update({region: getConfig().region});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

//return 0 : success
//      -1 : failure
function ec2_create() {
    console.log("ec2 create is called")
    // define AMI
    var instanceParams = {
        ImageId: getConfig().AMI,  //get this from configuration file
        InstanceType: 't2.micro',
        MinCount: 1,
        MaxCount: 1
    };

    return new Promise ((resolve, reject) => {
        // Create a promise on an EC2 service object
        var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();

        // Handle promise's fulfilled/rejected states
        instancePromise.then( data => {
            // console.log(data);
            var instanceId = data.Instances[0].InstanceId;
            console.log("Created instance", instanceId);
            addInstanceIdToMap(instanceId, data)
            
            getUsedInstanceCount().then((val) => console.log("current instance count : " + val))
            resolve()
            // printInstanceMap()
        }).catch( err => {
            console.error(err, err.stack);
            reject(err);
        });
    })

  
}

// ec2_create()

module.exports = {ec2_create};
