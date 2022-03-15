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
        // console.log(message)

        // console.log("sending a message")
        sqsutil.sendMessageRequestQueue(message)
        scale_up()
        respond.end(request.file.originalname + ' uploaded!');
        });





//format: terminate,<instance-id>
function processTermiateRequest(instanceId) {
    console.log("req received to terminate " + instanceId)
    instanceId = instanceId.replace(/"/g,'')
    console.log(instanceId)

    
    try {
        removeInstanceId(instanceId).then(() => {
            terminate_ec2 (instanceId).then( () => {

            }).catch(e => {
                console.log("failed to remove terminating instance : Non Fatal failure")
            })
        }).then( () => {
            {
                decreaseUsedInstanceByOne().then( () => {
                    getUsedInstanceCount().then (data => console.log("used instances " + data))
                    .catch(e => {console.log("err in getUsedInstanceCount")})
                }).catch (e => {
                        console.log("Error in decreaseUsedInstanceByOne")
                })
            }
        }).catch (e => {
            console.log("Error remove InstanceId")
        })
    } catch (e){ 
        console.log("There is some error in deleting instance")
    }
}


function postProcessImage() {
    
    // console.log("Response process request received")
    let fileName = ""
    let result = ""
    return new Promise((resolve, reject) => {
      try {
            // console.log("Going to wait for messages in response Q")
            helper.processResponseQ().then(messages => {
                if (messages != null) {
                    // console.log("Total messages" + messages.length)
                    // console.log("Message Body: " + messages.Body)
                    for (let i = 0; i < messages.length; ++i) {
                        console.log("Main : Message is " + messages[i].Body)
                        let tokens = messages[i].Body.split(",")
                        console.log(tokens[0])
                        if (tokens[0].includes("terminate")) {
                            processTermiateRequest(tokens[0].split(":")[1].trim())
                        } else {
                            fileName = tokens[0].split(":")[1]
                            result = tokens[1].split(":")[1]
                        }
                        writeResult(fileName, result)
                        // console.log(fileName, result)s
                        resolve()
                        // postProcessImageV2()
                    }
                }
            }).catch(e => {
                console.log("some error in response queue received " + e)
                reject(e)
            }).finally( () => {
                resolve()
                postProcessImage()
            }) 
      } catch (e) {
          reject(e)
      } finally {
      }
    })
}

postProcessImage()
console.log("starting server")

//You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine

// hostname = "0.0.0.0"`
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
});




