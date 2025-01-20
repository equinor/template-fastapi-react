FROM nginx:1.27.3-alpine AS server

RUN apk upgrade --update-cache

# Run as non-root
RUN deluser nginx
RUN adduser --disabled-password --no-create-home --gecos "" --uid 1000  nginx

# Copy configs
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/config/ /etc/nginx/config

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy sites-available into sites-enabled
COPY nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf

# Create log directory if not present, set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Create tmp directory if not present, set permissions
RUN mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx

# Create pidfile, set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Run master process as non-root user
USER 1000

FROM node:23 AS base
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

WORKDIR /code
COPY ./ ./
RUN yarn install

FROM base AS development
CMD ["yarn", "start"]

FROM server AS nginx-dev
COPY nginx/environments/web.dev.conf  /etc/nginx/environments/

FROM base AS build
RUN yarn build

FROM server AS nginx-prod
COPY nginx/environments/web.prod.conf /etc/nginx/environments/
COPY --from=build /code/build /data/www
