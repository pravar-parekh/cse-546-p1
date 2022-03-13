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
        MaxCount: 1,
        KeyName: 'ami-instance-1',
        SecurityGroups:['launch-wizard-1'],
        UserData:'Q29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKTUlNRS1WZXJzaW9uOiAxLjAKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L2Nsb3VkLWNvbmZpZzsgY2hhcnNldD0idXMtYXNjaWkiCk1JTUUtVmVyc2lvbjogMS4wCkNvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IDdiaXQKQ29udGVudC1EaXNwb3NpdGlvbjogYXR0YWNobWVudDsgZmlsZW5hbWU9ImNsb3VkLWNvbmZpZy50eHQiCgojY2xvdWQtY29uZmlnCmNsb3VkX2ZpbmFsX21vZHVsZXM6Ci0gW3NjcmlwdHMtdXNlciwgYWx3YXlzXQoKLS0vLwpDb250ZW50LVR5cGU6IHRleHQveC1zaGVsbHNjcmlwdDsgY2hhcnNldD0idXMtYXNjaWkiCk1JTUUtVmVyc2lvbjogMS4wCkNvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IDdiaXQKQ29udGVudC1EaXNwb3NpdGlvbjogYXR0YWNobWVudDsgZmlsZW5hbWU9InVzZXJkYXRhLnR4dCIKCiMhL2Jpbi9iYXNoCi9iaW4vZWNobyAtZSAiLT0tPS09LUkgZXhlY3V0ZSBldmVyeSB0aW1lIHRoZSBTZXJ2ZXIgQm9vdHMtPS09LT0tXG4gTGFzdCBleGVjdXRpb24gdGltZTpgZGF0ZWBcbiIgPj4gL3RtcC9gZGF0ZSArJVktJW0tJWRgCnB5dGhvbjMgL2hvbWUvZWMyLXVzZXIvY3NlLTU0Ni1wMS9hcHAtc2VydmVyL2FwcC5weSAmPiAvaG9tZS9lYzItdXNlci9sb2cudHh0IAp0b3VjaCAvaG9tZS9lYzItdXNlci91c2VyX3NjcmlwdC50eHQKZWNobyAiSGkgRVh7IFRoZXJlIiA+PiAvaG9tZS9lYzItdXNlci91c2VyX3NjcmlwdC50eHQKLS0vLwo='
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
