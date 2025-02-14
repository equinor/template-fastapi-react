#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname -- "$0")" && pwd -P)"
readonly ROOT_DIR

if [ "$1" = 'api' ]; then
  python3 "$ROOT_DIR/app.py" run
else
  exec "$@"
fi
