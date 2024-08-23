#!/bin/sh
set -eu

if [ "$1" = 'api' ]; then
  uv run ./app.py run
else
  exec "$@"
fi
