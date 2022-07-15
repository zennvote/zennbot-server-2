#!/bin/bash

docker stop zennbot-web
docker rm zennbot-web

docker pull 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web:latest
docker run -d --name zennbot-web 998737244507.dkr.ecr.ap-northeast-2.amazonaws.com/zennbot-web

docker rm $(docker ps --filter status=exited -q)
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)