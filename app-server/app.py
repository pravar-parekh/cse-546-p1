from cProfile import run
from urllib import request, response
import webbrowser
import boto3, json
from botocore.exceptions import NoCredentialsError
from ec2_metadata import ec2_metadata
import subprocess
import requests
import base64

sqs = boto3.client("sqs")
webserver_hostname = ''
hostname_permanent = ''

f = open("/home/ec2-user/cse-546-p1/config/configuration.json")
data =  json.load(f)
request_queue_url = data["SQS_REQUEST_URL"]
response_queue_url = data["SQS_RESPONSE_URL"]
s3_input_bucket = data["s3-INPUT"]
s3_result_bucket = data["s3-RESULT"]

model_python_file = "/home/ec2-user/face_recognition.py"
base_directory = "/home/ec2-user/"


def decode_save_image(image_data, image_name):
    with open(image_name, "wb") as fh:
        fh.write(base64.b64decode(image_data))

def send_message(message):
    response = sqs.send_message(QueueUrl=response_queue_url,MessageBody=json.dumps(message))
    # print(response)



def receive_message():
    response = sqs.receive_message(
        QueueUrl=request_queue_url,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=10,
    )

    # print(f"Number of messages received: {len(response.get('Messages', []))}")

    for message in response.get("Messages", []):
        message_body = message["Body"]
        
        message_split = message_body.split(",")
        image_data = message_split[1]
        image_name = message_split[0]
        hostname = message_split[2]
        decode_save_image(image_data, base_directory + "img/" + image_name)

        delete_message(message['ReceiptHandle'])

    if len(response.get('Messages', [])) > 0 :
        return True, image_name, hostname
    
    else: 
        return False, "", ""

def delete_message(receipt_handle):
    response = sqs.delete_message(
        QueueUrl=request_queue_url,
        ReceiptHandle=receipt_handle,
    )
    # print(response)

def ping_webserver(hostname, ping_type):
    if ping_type == 1: 
        ami_id= requests.get('http://169.254.169.254/latest/meta-data/instance-id').text
        post_req_text = ami_id
        resp = requests.post("http://" + hostname + ":3000/terminate", {'id' : post_req_text})

    else: 
        post_req_text = "image_processed"  
        resp = requests.post("http://" + hostname + ":3000/image_processed", {'msg' : post_req_text})
    

def upload_to_aws(local_file, bucket, s3_file):
    s3 = boto3.client('s3')

    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False

def upload_result(bucket_name,file_name,txt_data):
    session=boto3.Session(profile_name='default')

    s3 = session.resource('s3')

    object = s3.Object(bucket_name, file_name)

    result = object.put(Body=txt_data)

    res = result.get('ResponseMetadata')

#### pip3 install ec2-metadata
def terminate_instance():
    client = boto3.client('ec2')
    client.terminate_instances(InstanceIds=[ec2_metadata.instance_id])

if __name__ == "__main__":
    loop_count = 0
    max_loop_count = 1

    while(loop_count < max_loop_count):
        run_flag, image_name, webserver_hostname = receive_message()
        image_file = "img/" + image_name

        if hostname_permanent == '':
            hostname_permanent = webserver_hostname

        if run_flag:
            bashCommand = "python3 "+ model_python_file + " " + base_directory + image_file
            process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
            output, error = process.communicate()
            output = output.decode("utf-8")
            output = output[:len(output)-1]
            
            message = {"File": image_name[:len(image_name) - 4],"Output": output}
            send_message(message)
            loop_count = 0

            print(output, image_name)
            uploaded = upload_to_aws(base_directory + image_file, s3_input_bucket, image_name[:len(image_name) - 4])
            upload_result1 = upload_result(s3_result_bucket, image_name[:len(image_name) - 4], output)
        
        else:
            loop_count += 1
    

    ami_id= requests.get('http://169.254.169.254/latest/meta-data/instance-id').text
    print(ami_id)
    message = {"terminate":ami_id,"end":"end"}
    send_message(message)
