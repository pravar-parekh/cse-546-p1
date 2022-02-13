// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

//get AMI name from configuration file

// do we need a key pair or IAM priviledge is enough, need to check later on this - NO


//return 0 : success
//      -1 : failure
function ec2_create() {
    var status = 0;

    // define AMI
    var instanceParams = {
        ImageId: 'ami-0fdc2ea03ba54acd6',  //get this from configuration file
        InstanceType: 't2.micro',
        MinCount: 1,
        MaxCount: 1
    };

    // Create a promise on an EC2 service object
    var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();

    // Handle promise's fulfilled/rejected states
    instancePromise.then(
        function(data) {
            console.log(data);
            var instanceId = data.Instances[0].InstanceId;
            console.log("Created instance", instanceId);
            // Add tags to the instance
            tagParams = {Resources: [instanceId], Tags: [
            {
                Key: 'Name',
                Value: 'InstanceCreated' // need a unique name
            }
            ]};
        
            // Create a promise on an EC2 service object
            var tagPromise = new AWS.EC2({apiVersion: '2016-11-15'}).createTags(tagParams).promise();
            // Handle promise's fulfilled/rejected states
            tagPromise.then(
                function(data) {
                console.log("Instance tagged");
            }).catch(
                function(err) {
                console.error(err, err.stack);
                return -1;
            });
    }).catch(
        function(err) {
        console.error(err, err.stack);
        return -1;
    });
    
    
    return status;
}

module.exports = {ec2_create};
