#!/bin/bash

cp /var/env/zennbot/* .
cp /var/env/zennbot/.env .env

docker-compose up -d --build
