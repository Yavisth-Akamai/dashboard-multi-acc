#!/bin/bash

ENV=$1
API=""
CORS=""

if [ "$ENV" == "minikube" ]; then
  API="http://dash-be:3000"
  CORS="http://dash-fe:3001"
elif [ "$ENV" == "prod" ]; then
  API="http://$2:30000"
  CORS="http://$2:30001"
else
  API="http://localhost:3000"
  CORS="http://localhost:3001"
fi

echo "Building frontend..."
docker buildx build --platform linux/amd64 --build-arg REACT_APP_API_BASE_URL=$API --no-cache -t bpgcstag.azurecr.io/gcbpcicd/dash-fe:v0.0.2 ./dash-fe --push

echo "Building backend..."
docker buildx build --platform linux/amd64 --build-arg FRONTEND_URL=$CORS --no-cache -t bpgcstag.azurecr.io/gcbpcicd/dash-be:v0.0.2 ./dash-be --push