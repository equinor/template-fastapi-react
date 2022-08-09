# Fails to build styled-components with node 18
FROM node:16 as base
ARG AUTH_ENABLED=0
ARG REDIRECT_URI=http://localhost/
# Azure AD requires a scope.
ARG AUTH_SCOPE=""
ARG CLIENT_ID=""
ARG TENANT_ID=""
ENV REACT_APP_AUTH_SCOPE=$AUTH_SCOPE
ENV REACT_APP_AUTH=$AUTH_ENABLED
ENV REACT_APP_AUTH_CLIENT_ID=$CLIENT_ID
ENV REACT_APP_AUTH_TENANT=$TENANT_ID
ENV REACT_APP_TOKEN_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/v2.0/token
ENV REACT_APP_AUTH_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/v2.0/authorize
ENV REACT_APP_LOGOUT_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/logout
ENV REACT_APP_AUTH_REDIRECT_URI=$REDIRECT_URI

WORKDIR /code
COPY ./ ./
RUN yarn install --immutable --immutable-cache

FROM base as development
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:18-alpine as prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
USER 1000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]
EXPOSE 3000
