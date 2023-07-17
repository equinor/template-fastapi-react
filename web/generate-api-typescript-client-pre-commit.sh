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
    cd web
    yarn openapi -i http://localhost:5000/openapi.json -o "$PWD/src/api/generated"
fi