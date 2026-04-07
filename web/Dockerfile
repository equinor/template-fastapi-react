# syntax=docker/dockerfile:1
FROM dhi.io/nginx:1.29.5-debian13 AS server
HEALTHCHECK CMD ["nginx", "-t"]

# Copy configs
COPY nginx/rootfs/ /

FROM dhi.io/node:25.9.0-debian13-dev AS base
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

RUN mkdir /code && \
    chown -R "node:node" /code

RUN corepack enable

WORKDIR /code
USER "node"

COPY --chown="node:node" .yarnrc.yml .pnp.cjs .pnp.loader.mjs package.json yarn.lock ./
ENV YARN_CACHE_FOLDER="/var/lib/yarn"
RUN --mount=type=cache,target="$YARN_CACHE_FOLDER" \
    yarn install

COPY --chown="node:node" index.html tsconfig.json vite.config.mts vitest.config.mts ./

COPY --chown="node:node" public public
COPY --chown="node:node" src src

FROM base AS development
CMD ["yarn", "start"]

FROM server AS nginx-dev
COPY nginx/environments/web.dev.conf  /etc/nginx/environments/

FROM base AS build
RUN yarn build

FROM server AS nginx-prod
COPY nginx/environments/web.prod.conf /etc/nginx/environments/
COPY --from=build /code/build /data/www
