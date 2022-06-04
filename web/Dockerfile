FROM node:14 as base
WORKDIR /code
ADD package.json yarn.lock /code/
ADD ./ /code/
RUN yarn install --frozen-lockfile
# To be able to call node modules binaries
ENV PATH=$PATH:./node_modules/.bin/

FROM base as development
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:12-alpine as prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
USER 1000
CMD ["serve", "--single", "/code/build", "--listen", "8001"]
EXPOSE 8001

