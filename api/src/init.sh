#!/bin/sh
set -eu

if [ "$1" = 'api' ]; then
  exec python3 -m app run
else
  exec "$@"
fi
