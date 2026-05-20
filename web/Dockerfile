# syntax=docker/dockerfile:1
FROM dhi.io/nginx:1.30.0-debian13 AS server
HEALTHCHECK CMD ["nginx", "-t"]

# Copy configs
COPY nginx/rootfs/ /

# Keep the node patch in sync with `node = ...` in .mise/config.toml.
FROM dhi.io/node:24.13.1-debian13-dev AS base
ARG AUTH_ENABLED=0
ENV VITE_AUTH=$AUTH_ENABLED

RUN mkdir /code && \
    chown -R "node:node" /code

RUN corepack enable

# Workaround: repo.yarnpkg.com (GitHub Pages mirror corepack uses by default)
# is currently returning 404, which makes corepack silently cache an empty
# yarn.js. Pointing corepack at the npm registry uses @yarnpkg/cli-dist
# instead and produces a working yarn binary.
ENV COREPACK_NPM_REGISTRY=https://registry.npmjs.org

WORKDIR /code
USER "node"

COPY --chown="node:node" .yarnrc.yml package.json yarn.lock ./
ENV YARN_CACHE_FOLDER="/var/lib/yarn"
RUN --mount=type=cache,target="$YARN_CACHE_FOLDER" \
    yarn install --immutable

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

# No-auth local-dev variant: same as nginx-prod but overrides default.conf
# with a version that drops the oauth2-proxy auth_request hops.
# Use via: docker compose -f docker-compose.yml -f docker-compose.no-auth.yml up
FROM server AS nginx-noauth
COPY nginx/environments/web.prod.conf /etc/nginx/environments/
COPY --from=build /code/build /data/www
COPY nginx/conf.d/default.noauth.conf /etc/nginx/conf.d/default.conf

# No-auth + hot-reload variant: proxies / to the vite dev server (web:3000)
# and drops the oauth2-proxy auth_request hops. Used by docker-compose.no-auth.yml.
FROM server AS nginx-dev-noauth
COPY nginx/environments/web.dev.conf /etc/nginx/environments/
COPY nginx/conf.d/default.noauth.conf /etc/nginx/conf.d/default.conf
