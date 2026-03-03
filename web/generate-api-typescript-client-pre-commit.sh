#!/bin/bash
set -eo

PATTERN="api/src/features/*"
PATTERN+="|api/src/entities/*"
PATTERN+="|api/src/common/*"
PATTERN+="|api/src/authentication/*"

CHANGED_API_FILES=()
while read -r; do
  CHANGED_API_FILES+=("$REPLY")
done < <(git diff --name-only --cached --diff-filter=ACMR | grep -E "$PATTERN")

if [ ${#CHANGED_API_FILES[@]} -eq 0 ]; then
  echo "No changes in API relevant files. No need to generate API."
  exit 0
fi

echo "Changes detected in API relevant files. Generating API ..."

readonly ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")
OPENAPI_FILE="api/.openapi.json"

# Generate OpenAPI spec directly from Python (no running server needed)
if ! (cd "$ROOT_DIR/api" && PYTHONPATH=src uv run python -m app open-api); then
  echo "Failed to generate the OpenAPI specification."
  exit 1
fi

# Use grep to extract the name from the OpenAPI specification
NAME=$(grep -o '"title": *"[^"]*"' "$ROOT_DIR/$OPENAPI_FILE" | head -1 | awk -F '"' '{print $4}')

# Check if the name is empty or null
if [ -z "$NAME" ]; then
  echo "Name of API not found in the OpenAPI specification."
  rm -f "$ROOT_DIR/$OPENAPI_FILE"
  exit 1
elif [ "$NAME" != "Template FastAPI React" ]; then
  echo "The openapi specification ('$NAME') does not seem to belong to 'Template FastAPI React'"
  rm -f "$ROOT_DIR/$OPENAPI_FILE"
  exit 1
else
  cd "$ROOT_DIR/web"
  yarn openapi -i "$ROOT_DIR/$OPENAPI_FILE" -o "$PWD/src/api/generated"
  echo "API Client successfully generated"
fi
