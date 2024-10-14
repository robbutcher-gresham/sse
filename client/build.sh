#!/bin/bash
set -euo pipefail

BASE_IMAGE="us-east1-docker.pkg.dev/gothic-parser-227615/ccm/sse-client"

echo "==> Building docker image locally"
docker build -t $BASE_IMAGE .
echo "==> Configure docker for gcloud"
gcloud beta auth configure-docker us-east1-docker.pkg.dev --quiet
echo "==> Publishing docker image"
docker push us-east1-docker.pkg.dev/gothic-parser-227615/ccm/sse-client
IMAGE_ID=$(docker inspect us-east1-docker.pkg.dev/gothic-parser-227615/ccm/sse-client --format='{{index .RepoDigests 0}}')

export IMAGE_ID="$IMAGE_ID";
echo "New image id is: $IMAGE_ID"

envsubst < k8s-deployment-client-template.yaml > k8s-deployment-client.yaml  

echo "The k8s-deployment-client.yaml has been updated"
