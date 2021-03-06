// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const { getConfig } = require('../config/config-reader');
// Set the region 
AWS.config.update({region: getConfig().region});

const MessageRetentionPeriod = '2000';


// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

function create_SQS_revised(name, cb) {
    var params = {
        QueueName: name,
        Attributes: {
            'DelaySeconds': '0',
            'MessageRetentionPeriod': MessageRetentionPeriod
        }
    };


    return new Promise((resolve, reject) => {
        sqs.createQueue(params, function(err, data) {
            if (err) {
                reject(-1);
            } else {
                resolve(data);
            }
        });

    });

}

function delete_SQS_revised(name) {
    var params = {
        QueueUrl: name
    };

    return new Promise ((resolve, reject) => {
        sqs.deleteQueue(params, function(err, data) {
            if (err) {
                console.log("Failed to delete SQS...Please delete retry later. ", err);
                resolve(-1)
            } else {
                console.log("delete SQS successful", data);
                resolve(data);
            }
        });
    });
    
}

function sleep(time) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            // console.log(`sleeping for ${time}`);
            res();
        }, time);
    });
}

function getAttribute(params) {
    return new Promise((res, rej) => {
        sqs.getQueueAttributes(params, function(err, data){
        if (err) {
            console.log(err)
            rej(-1);
        } else {
            // console.log(data.Attributes);
            res(data)
        }
        });
    });
}

function sendMessageRequestQueue(messg) {
    var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
       DelaySeconds: 0,
       MessageBody: messg,
       // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
       // MessageGroupId: "Group1",  // Required for FIFO queues
       QueueUrl: getConfig().SQS_REQUEST_URL
     };

     sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
 }

function sendMessageResponseQueue(messg) {
    var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
       DelaySeconds: 0,
       MessageBody: messg,
       QueueUrl: getConfig().SQS_RESPONSE_URL
     };

     sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
}

function getMessageFromResponseQ() {
    var params = {
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 120,
        WaitTimeSeconds: 15,
        QueueUrl: getConfig().SQS_RESPONSE_URL
       };

    return new Promise ((resolve, reject) => {
        // console.log("Waiting to receive message from AWS")
        sqs.receiveMessage(params, function(err, data) {
          //  console.log("Absolute response received")
          //  console.log(data.Messages)
          //  console.log(err)
            if (err) {
              console.log("Receive Error", err);
              reject("Failed to receive message")
            } else if (data.Messages) {
              // console.log("received some response from AWS Q")
              if (data.Messages.length == 0) {
                // console.log("Message length is zero")
                resolve(data.Messages)
              } else {
                // console.log("Going to delete the message")
                resolve(data.Messages)
                var deleteParams = {
                  QueueUrl: getConfig().SQS_RESPONSE_URL,
                  ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                  if (err) {
                    console.log("Delete Error from AWS for response QUEUE: Most likely AWS side error", err);
                  } else {
                    // console.log("Deletion successfull");
                  }
                });
              }
            } else {
              // console.log("void")
              resolve()
            }
          });
    })
}

getMessageFromResponseQ()

module.exports = { create_SQS_revised, delete_SQS_revised, sleep, getAttribute, sendMessageResponseQueue, 
                   sendMessageRequestQueue, getMessageFromResponseQ };