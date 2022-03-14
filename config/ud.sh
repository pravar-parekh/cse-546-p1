Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0

--//
Content-Type: text/cloud-config; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="cloud-config.txt"

#cloud-config
cloud_final_modules:
- [scripts-user, always]

--//
Content-Type: text/x-shellscript; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="userdata.txt"

#!/bin/bash
/bin/echo -e "-=-=-=-I execute every time the Server Boots-=-=-=-\n Last execution time:`date`\n" >> /tmp/`date +%Y-%m-%d`
python3 /home/ec2-user/cse-546-p1/app-server/app.py &> /home/ec2-user/log.txt 
touch /home/ec2-user/user_script.txt
echo "Hi EX{ There" >> /home/ec2-user/user_script.txt
--//
