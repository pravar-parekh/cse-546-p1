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
const sqsutil = require('./sqs-utility')


var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

server.use(express.static('public'));
const upload = multer({dest: __dirname + '/upload_images'});

// "myfile" is the key of the http payload
server.post('/', upload.single('myfile'), function(request, respond) {
        console.log("Request received");

        console.log("requested file : " + request.file.originalname)
        let reqFile = request.file
        
        var fs = require('fs');
       
        //TODO: Verify the image is of image type and size is less than 250KB
        var message = helper.base64_encode(reqFile.path, "jpg") // do we care if the extension is jpg (may be one of the last items to fix)
        console.log(message)

        console.log("sending a message")
        sqsutil.sendMessageRequestQueue(message)
        respond.end(request.file.originalname + ' uploaded!');

        });

console.log("starting server")

//You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine
const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});




