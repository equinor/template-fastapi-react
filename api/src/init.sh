#!/bin/sh
set -eu

if [ "$1" = 'api' ]; then
  exec python3 ./app.py run
else
  exec "$@"
fi
