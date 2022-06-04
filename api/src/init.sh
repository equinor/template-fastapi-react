#!/bin/sh
set -eu

if [ "$1" = 'api' ]; then
  if [ "${ENVIRONMENT:-'local'}" != "local" ]; then
    gunicorn app:create_app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
  else
    python3 /code/app.py run
  fi
else
  exec "$@"
fi
