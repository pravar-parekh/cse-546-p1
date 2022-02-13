/* import */
const express = require('express');
const multer = require('multer');
const server = express();
const PORT = 3000;

const config_reader = require("../config/config-reader")
const config = config_reader.getConfig();

const requestQUEUE = config.SQS_REQUEST;
const responseQUEUE = config.SQS_RESPONSE;

console.log(requestQUEUE, responseQUEUE)

const helper = require('./helper')

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


var EC2_CREATE = require("./create-ec2");
var SQS_CREATE = require("./create-sqs");
var SQS_DELETE = require("./delete-sqs");
var SQS_GETURL = require("./getURL-sqs");
const { SQS } = require("aws-sdk");
const { request } = require('http');

// Load credentials and set region from JSON file
AWS.config.update({region: 'us-east-1'});

var params = {
    QueueName: requestQUEUE,
    Attributes: {
        'DelaySeconds': '0',
        'MessageRetentionPeriod': '1800'
    }
};

sqs.createQueue(params, function(err, data) {
    if (err) {
        console.log("Error in Request creating Queue", err);
        return;
    } else {
        console.log("Success in request creating QUeue", data.QueueUrl);
        var params = {
            QueueName: responseQUEUE,
            Attributes: {
                'DelaySeconds': '0',
                'MessageRetentionPeriod': '1800' //replace from json
            }
        }

        sqs.createQueue(params, function (err, data) {
            if (err) {
                console.log("Error in creating response Queue", err);
                return;
            } else {
                console.log("Success in  creating response QUeue", data.QueueUrl);
                server.use(express.static('public'));
                const upload = multer({dest: __dirname + '/upload_images'});

            // "myfile" is the key of the http payload
            server.post('/', upload.single('myfile'), function(request, respond) {
            console.log("Request received");
            if(request.file) console.log(request.file);
            
            // save the image
            //TODO: Verify the image is of image type and size is less than 250KB
            var fs = require('fs');
            fs.rename(__dirname + '/upload_images/' + request.file.filename, __dirname + '/upload_images/' + request.file.originalname, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });
            

            //   var base64_encoded = helper.base64_encode(file, "jpg")

            respond.end(request.file.originalname + ' uploaded!');
            });
            
            console.log("starting server")

            //You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine
            const hostname = '0.0.0.0';
            server.listen(PORT, hostname, () => {
                console.log(`Server running at http://${hostname}:${PORT}/`);
            });
         }
        })
    }
});






