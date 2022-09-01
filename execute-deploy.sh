#!/bin/bash

docker stop zennbot-web || true
docker rm zennbot-web || true

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com
docker pull 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web:latest
docker run -d --name zennbot-web -p 3000:3000 -v /home/ec2-user/zennbot-logs:/usr/src/app/logs 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web

docker rm $(docker ps --filter status=exited -q) || true
docker rmi $(docker images --filter "dangling=true" -q --no-trunc) || true