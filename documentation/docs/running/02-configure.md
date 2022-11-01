# Configuration

This document goes through all the different configuration options available.

:::info

Remember to restart 

Any changes you make to this file will only come into effect when you restart the
server.

:::

## .env

First, let's look at the options available in the `.env` file.

### Web

#### Authentication

- `AUTH_ENABLED`: To enable or disable authentication
- `CLIENT_ID`: Find the app's client ID under Azure Active Directory service (also called application ID). The client ID is used to tell Azure which resource a user is attempting to access.
- `TENANT_ID`: Find tenant ID through the Azure portal under Azure Active Directory service. Select properties and under scroll down to the Tenant ID field.
- `AUTH_SCOPE`: Find the scope the Azure portal under Azure Active Directory service and App registrations. The scope is located under the expose an API.

### API 

#### System

- `ENVIRONMENT`: local for hot-reloading, or production for speed
- `LOGGER_LEVEL`: DEBUG, ERROR, INFO, WARN

#### Database

- `MONGODB_USERNAME`: The username
- `MONGODB_PASSWORD`: The password
- `MONGODB_HOSTNAME`: The host where it's running
- `MONGODB_DATABASE`: The database to connect to
- `MONGODB_PORT`: The port that is used

#### Authentication

- `OAUTH_TOKEN_ENDPOINT`: The endpoint to obtain tokens.
- `OAUTH_AUTH_ENDPOINT`: The authorization endpoint performs authentication of the end-user (this is done by redirecting the user agent to this endpoint).
- `OAUTH_WELL_KNOWN`: The endpoints that lists endpoints and other configuration options relevant to the OpenID Connect implementation in the project.
- `OAUTH_AUDIENCE`: If using azure ad, audience is the azure client id.
- `SECRET_KEY`: The secret used for signing JWT.

Used by the docs:

- `OAUTH_CLIENT_ID`: Find the app's client ID under Azure Active Directory service (also called application ID). The client ID is used to tell Azure which resource a user is attempting to access.
- `OAUTH_AUTH_SCOPE`: Find the scope the Azure portal under Azure Active Directory service and App registrations. The scope is located under the expose an API.