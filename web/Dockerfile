# syntax=docker/dockerfile:1
FROM dhi.io/nginx:1.30.0-debian13 AS server
HEALTHCHECK CMD ["nginx", "-t"]

# Copy configs
COPY nginx/rootfs/ /

FROM dhi.io/node:22-debian13-dev AS base
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

# Split the Vite output into the public dist (no source maps) and a
# symbols stage that retains *.map for App Insights upload. With
# `sourcemap: 'hidden'` the JS already lacks a sourceMappingURL comment,
# so dropping the maps from the served image is purely defence in depth
# (nothing references them, but no need to host them either).
FROM build AS dist
RUN find /code/build -name '*.map' -delete

FROM build AS symbols
# Consumed by CI: `docker build --target symbols --output type=local,dest=./symbols .`
# Then upload `./symbols/code/build/assets/*.map` to the App Insights
# symbol store (portal → App Insights → Source map support).

FROM server AS nginx-prod
COPY nginx/environments/web.prod.conf /etc/nginx/environments/
COPY --from=dist /code/build /data/www
