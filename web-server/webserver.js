/* import */
const express = require('express');
const multer = require('multer');
const server = express();
const PORT = 3000;

const config_reader = require("../config/config-reader")
const config = config_reader.getConfig();

const helper = require('./helper.js')
const sqsutil = require('./sqs-utility')

var AWS = require('aws-sdk');
const { writeResult } = require('./write-result');
const { scale_up } = require('./scale-ec2');

var os = require("os");
var hostname = os.hostname();




const { removeInstanceId, decreaseUsedInstanceByOne, getUsedInstanceCount, increaseUsedInstance } = require('./instanceMap');
const { terminate_ec2 } = require('./delete-ec2');
AWS.config.update({region: config.region});

server.use(express.static('public'));
const upload = multer({dest: __dirname + '/upload_images'});

// "myfile" is the key of the http payload
server.post('/', upload.single('myfile'), function(request, respond) {
        console.log("Request received");
        var os = 

        console.log("requested file : " + request.file.originalname)
        let reqFile = request.file
        
        var fs = require('fs');
       
        //TODO: Verify the image is of image type and size is less than 250KB
        var message = helper.base64_encode(reqFile.path, request.file.originalname, hostname) // do we care if the extension is jpg (may be one of the last items to fix)
        // message = "file:test, output:paul"
        console.log(message)

        // console.log("sending a message")
        sqsutil.sendMessageRequestQueue(message)
        scale_up()
        respond.end(request.file.originalname + ' uploaded!');
        });


//Response syntax : "file:test00,output:paul"
server.post('/image_processed', (req, res) => {
    postProcessImage()
    res.end(200);
})

function processTermiateRequest(instanceId) {
    console.log("req " + instanceId)
    
    removeInstanceId(instanceId).then(() => {
        terminate_ec2 ("i-0dd3c77410b339587")
    }).then( () => {
        {
            decreaseUsedInstanceByOne().then( () => {
                getUsedInstanceCount().then (data => console.log("used instances " + data))
            })
        }
    })
}

// processTermiateRequest("i-0ab9916c5a275da4e");


//called when an instance registers to terminate it self
server.post('/terminate', (req, res) => {
    console.log("received request to terminate " + req)
    processTermiateRequest(req.body);
    res.end(200);
})

function postProcessImage() {
    
    console.log("Response received")
    return new Promise((resolve, reject) => {
      try {
        helper.processResponseQ().then(messages => {
            console.log("Total messages" + messages.length)
            console.log("Message Body: " + messages.Body)
            for (let i = 0; i < messages.length; ++i) {
                console.log("Main : Message is " + messages[i].Body)
                let tokens = messages[i].Body.split(",")
                let fileName = tokens[0].split(":")[1]
                let result = tokens[1].split(":")[1]
    
                writeResult(fileName, result)
                // console.log(fileName, result)
                resolve()
    
            }
        })
      } catch (e) {
          reject(e)
          return;
      }
    })
}

console.log("starting server")

//You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine

// hostname = "0.0.0.0"
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});




