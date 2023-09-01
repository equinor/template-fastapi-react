#!/bin/bash
set -eo

PATTERN="api/src/features/*"
PATTERN+="|api/src/entities/*"

CHANGED_API_FILES=()
while read; do
  CHANGED_API_FILES+=("$REPLY")
done < <(echo "$(git diff --name-only --cached --diff-filter=ACMR)" | grep -E $PATTERN)

if [ ${#CHANGED_API_FILES[@]} -eq 0 ]; then
    echo "No changes in API relevant files. No need to generate API."
else
    echo "Changes detected in API relevant files. Generating API ..."
    # This requires the API to be running on localhost port 5000
    # Define the URL of the OpenAPI specification
    OPENAPI_URL="http://0.0.0.0:5000/openapi.json"

    # Use curl to fetch the OpenAPI specification and store it in a temporary file
    TEMP_FILE=$(mktemp)
    curl -s "$OPENAPI_URL" > "$TEMP_FILE"

    # Check if the curl command was successful
    if [ $? -ne 0 ]; then
      echo "Failed to fetch the OpenAPI specification."
      rm "$TEMP_FILE"
      exit 1
    fi

    # Use grep to extract the name from the OpenAPI specification
    NAME=$(grep -o -s '"title": *"[^"]*"' "$TEMP_FILE" | head -1 | awk -F '"' '{print $4}')

    # Check if the name is empty or null
    if [ -z "$NAME" ]; then
      echo "Name of API not found in the OpenAPI specification."
      exit 1
    elif [ "$NAME" != "Template FastAPI React" ]; then
      echo "The openapi specification found at localhost:5000 ('$NAME') does not seem to belong to 'Template FastAPI React'"
      exit 1
    else
      cd web
      yarn openapi -i http://localhost:5000/openapi.json -o "$PWD/src/api/generated"
      echo "API Client successfully generated"
    fi

    # Clean up the temporary file
    rm "$TEMP_FILE"
fi