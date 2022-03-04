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

const helper = require('./helper.js')
const sqsutil = require('./sqs-utility')


var AWS = require('aws-sdk');
const { writeResult } = require('./write-result');
const { rejects } = require('assert');
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
        message = "file:test, output:paul"
        // console.log(message)

        // console.log("sending a message")
        sqsutil.sendMessageRequestQueue(message)
        respond.end(request.file.originalname + ' uploaded!');

        });


//Response syntax : "file:test00,output:paul"

server.post('image_processed', (req, res) => {
    
})

function image_process_request() {
    var fs = require('fs');

    console.log("Response received")
    return new Promise((resolve, reject) => {
      try {
        helper.processResponseQ().then(messages => {
            console.log("Total messages" + messages.length)
            for (let i = 0; i < messages.length; ++i) {
                console.log("Main : Message is " + messages[i].Body)
                let tokens = messages[i].Body.split(",")
                let fileName = tokens[0].split(":")[1]
                let result = tokens[1].split(":")[1]
    
                writeResult(fileName, result)
                // console.log(fileName, result)
    
            }
        })
      } catch (e) {
          reject(e)
          return;
      }

    })
    
}

image_process_request()

console.log("starting server")

//You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine
const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});




