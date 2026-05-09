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

WORKDIR /code
USER "node"

COPY --chown="node:node" .yarnrc.yml package.json yarn.lock ./
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
