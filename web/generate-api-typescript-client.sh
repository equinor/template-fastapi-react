#! /usr/bin/env bash

# This requires the API to be running on localhost port 5000

docker run --rm --network="host" -v ${PWD}/web/src/api:/local openapitools/openapi-generator-cli:v5.1.0 generate \
    -i http://127.0.0.1:5000/openapi.json \
    -g typescript-axios \
    --additional-properties=useSingleRequestParameter=true,withSeparateModelsAndApi=true,apiPackage=api,modelPackage=models \
    -o /local/generated