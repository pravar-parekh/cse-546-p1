from cProfile import run
from urllib import request, response
import boto3, json
from botocore.exceptions import NoCredentialsError
import subprocess
import requests
import base64

sqs = boto3.client("sqs")
request_queue_url = 'https://sqs.us-east-1.amazonaws.com/547230687929/Request_Queue'
response_queue_url = 'https://sqs.us-east-1.amazonaws.com/547230687929/Response_Queue'

def decode_save_image(image_data, image_name):
    with open(image_name, "wb") as fh:
        fh.write(base64.b64decode(image_data))

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
        
        message_split = message_body.split(",")
        image_data = message_split[1]
        image_name = message_split[0]
        decode_save_image(image_data, "img/" + image_name)

        delete_message(message['ReceiptHandle'])

    if len(response.get('Messages', [])) > 0 :
        return True, image_name
    
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


if __name__ == "__main__":
    loop_count = 0
    while(loop_count < 6):
        run_flag, image_name = receive_message()
        image_file = "img/" + image_name

        if run_flag:
            bashCommand = "python3 face_recognition.py " + image_file
            process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
            output, error = process.communicate()
            output = output.decode("utf-8")
            output = output[:len(output)-1]
            
            send_message(file=image_name[:len(image_name) - 4], output=output)
            uploaded = upload_to_aws(r'C:\Users\Dell\Desktop\cloud computing\face_images_100\test_00.jpg',
                                     'ccinputimages', 'Test_00')
            upload_result1 = upload_result('recognitionresults', 'test_00', 'Paul')
        
        else:
            loop_count += 1
    
    ping_webserver()
