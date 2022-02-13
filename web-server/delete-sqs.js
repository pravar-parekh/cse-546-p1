// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


function delete_SQS(name) {
    var params = {
        QueueUrl: name
    };

    sqs.deleteQueue(params, function(err, data) {
    if (err) {
        console.log("Failed to delete SQS...Please delete retry later. ", err);
    } else {
        console.log("deleted SQS", data);
    }
    });
}

module.exports =  { delete_SQS }; 