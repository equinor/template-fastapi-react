# syntax=docker/dockerfile:1
FROM nginx:1.27.4-alpine3.21-slim AS server

# Create a non-root user, which will be running the server

RUN <<EOF
#!/usr/bin/env sh
set -eu

# Ensure that the nginx-user has a uid >= 1000
# that way, it is not a privileged user, and radix will be happy
deluser "nginx"
adduser \
    --disabled-password \
    --no-create-home \
    --gecos "" \
    --uid 1000 \
    "nginx"

# Remove default nginx config
rm /etc/nginx/conf.d/default.conf

# Create log directory if not present, set permissions
mkdir -p /var/log/nginx
chown -R "nginx:nginx" /var/log/nginx

# Create tmp directory if not present, set permissions
mkdir -p /tmp/nginx
chown -R "nginx:nginx" /tmp/nginx

# Create pidfile, set permissions
touch /var/run/nginx.pid
chown -R "nginx:nginx" /var/run/nginx.pid
EOF

# Copy configs
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/config/ /etc/nginx/config

# Copy sites-available into sites-enabled
COPY nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf

# Run master process as non-root user
USER 1000

FROM node:22.13.1-alpine3.21 AS base
ARG AUTH_ENABLED=0
# Azure AD requires a scope.
ARG AUTH_SCOPE=""
ARG CLIENT_ID=""
ARG TENANT_ID=""
ENV VITE_AUTH_SCOPE=$AUTH_SCOPE
ENV VITE_AUTH=$AUTH_ENABLED
ENV VITE_AUTH_CLIENT_ID=$CLIENT_ID
ENV VITE_AUTH_TENANT=$TENANT_ID
ENV VITE_TOKEN_ENDPOINT=https://login.microsoftonline.com/${VITE_AUTH_TENANT}/oauth2/v2.0/token
ENV VITE_AUTH_ENDPOINT=https://login.microsoftonline.com/${VITE_AUTH_TENANT}/oauth2/v2.0/authorize
ENV VITE_LOGOUT_ENDPOINT=https://login.microsoftonline.com/${VITE_AUTH_TENANT}/oauth2/logout

ENV YARN_CACHE_FOLDER=/var/cache/yarn

RUN mkdir /code && \
    chown -R "node:node" /code

WORKDIR /code
USER "node"
COPY --chown="node:node" package.json yarn.lock ./
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER,uid=1000 \
     yarn install

COPY --chown="node:node" public public
COPY --chown="node:node" tsconfig.json vite.config.mts index.html ./
COPY --chown="node:node" src src

FROM base AS development
ENV YARN_CACHE_FOLDER=""
CMD ["yarn", "start"]

FROM server AS nginx-dev
COPY nginx/environments/web.dev.conf  /etc/nginx/environments/

FROM base AS build
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER,uid=1000 \
    yarn build

FROM server AS nginx-prod
COPY nginx/environments/web.prod.conf /etc/nginx/environments/
COPY --from=build /code/build /data/www
