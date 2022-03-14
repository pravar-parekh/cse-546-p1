// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});



//  (process.argv[2].toUpperCase() === "STOP") {
  // Call EC2 to stop the selected instances
  
function stop_ec2 (instanceId) {

    var params = {
        InstanceIds: [instanceId],
        DryRun: true
      };
      
  ec2.stopInstances(params, function(err, data) {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.stopInstances(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else if (data) {
            console.log("Success", data.StoppingInstances);
          }
      });
    } else {
      console.log("You don't have permission to stop instances");
    }
  });
}

function terminate_ec2 (instanceId) {
    return new Promise((resolve, reject) => {
        var params = {
            InstanceIds: [instanceId],
            DryRun: true
          };
          
        ec2.terminateInstances(params, function(err, data) {
          if (err && err.code === 'DryRunOperation') {
            params.DryRun = false;
            ec2.terminateInstances(params, function(err, data) {
                if (err) {
                  reject ("Error", err);
                } else if (data) {
                    console.log("deleted instance successfully")
                    resolve()
                }
            });
          } else {
            console.log("You don't have permission to stop instances");
            reject ("Error", err);
          }
        });
    })

}

// stop_ec2("i-0eb36a0525d425535");
// terminate_ec2("i-0ab9916c5a275da4e")

module.exports = { terminate_ec2 }