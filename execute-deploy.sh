#!/bin/bash

cd /home/ec2-user/zennbot-deploy

$(aws ecr get-login --region ap-northeast-2 --no-include-email)
docker rm -f zennbot-web
docker pull 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web:latest
docker run -d --name zennbot-web -p 3000:3000 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web

docker rm $(docker ps --filter status=exited -q)
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)