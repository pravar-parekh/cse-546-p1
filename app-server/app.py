from cProfile import run
from urllib import request, response
import boto3, json
import subprocess
import requests

sqs = boto3.client("sqs")
request_queue_url = 'https://sqs.us-east-1.amazonaws.com/547230687929/Request_Queue'
response_queue_url = 'https://sqs.us-east-1.amazonaws.com/547230687929/Response_Queue'

def send_message(file, output):

    message = {
        "File": file,
        "Output": output}
    response = sqs.send_message(
        QueueUrl=response_queue_url,
        MessageBody=json.dumps(message)
    )
    print(response)

def receive_message():
    response = sqs.receive_message(
        QueueUrl=request_queue_url,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=10,
    )

    print(f"Number of messages received: {len(response.get('Messages', []))}")

    for message in response.get("Messages", []):
        message_body = message["Body"]
        print(f"Message body: {message_body}")
        print(f"Receipt Handle: {message['ReceiptHandle']}")
        delete_message(message['ReceiptHandle'])

    if len(response.get('Messages', [])) > 0 :
        return True, "test_00.jpg"
    
    else: 
        return False, ""

def delete_message(receipt_handle):
    response = sqs.delete_message(
        QueueUrl=request_queue_url,
        ReceiptHandle=receipt_handle,
    )
    print(response)

def ping_webserver():
    ami_id= requests.get('http://169.254.169.254/latest/meta-data/instance-id').text  
    resp = requests.post('http://www.google.com')
    return resp

def save_to_s3():
    return

if __name__ == "__main__":
    run_flag = False
    while(run_flag == False):
        run_flag, image_name = receive_message()
        image_file = "img/" + image_name

        if run_flag:
            bashCommand = "python3 face_recognition.py " + image_file
            process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
            output, error = process.communicate()
            output = output.decode("utf-8")
            output = output[:len(output)-1]
            
            send_message(file=image_name[:len(image_name) - 4], output=output)
