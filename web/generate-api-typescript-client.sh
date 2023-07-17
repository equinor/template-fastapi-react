#!/bin/bash

# This requires the API to be running on localhost port 5000
yarn openapi -i http://localhost:5000/openapi.json -o "$PWD/src/api/generated"

