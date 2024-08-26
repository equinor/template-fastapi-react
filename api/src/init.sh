#!/bin/sh
set -eu

if [ "$1" = 'api' ]; then
  python ./app.py run
else
  exec "$@"
fi
