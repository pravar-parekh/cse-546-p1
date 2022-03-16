

const config_reader = require("../config/config-reader")
const config = config_reader.getConfig();

var AWS = require('aws-sdk');
AWS.config.update({region: config.region});


var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

var params = {
    Filters: [
       {
        Name: "instance-type", 
        Values: [
         "t2.micro"
        ]
       },
       {
        Name:"instance-state-name",
        Values: [
          "pending",
          "running"
        ]
       }
    ]
};


function getNumberOfInstances() {
    return new Promise((resolve, reject) => {
        ec2.describeInstances(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); 
                reject(err)
            } else   {
                console.log("NUMBEER of instances running/pending " + data.Reservations.length)
                resolve(data.Reservations.length)
            }
        });
    })
}

module.exports = {  getNumberOfInstances }

