#!/bin/bash

cp /var/env/zennbot/* .
cp /var/env/zennbot/.env .env

docker-compose up -d --build

docker rm $(docker ps --filter status=exited -q)
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)