import click
from fastapi import APIRouter, FastAPI, Security
from starlette.middleware import Middleware

from authentication.authentication import auth_with_jwt
from common.exception_handlers import add_exception_handlers
from common.middleware import LocalLoggerMiddleware, OpenCensusRequestLoggingMiddleware
from common.responses import responses
from config import config
from features.health_check import health_check_feature
from features.todo import todo_feature
from features.whoami import whoami_feature

description_md = """
### Description
A RESTful API for handling todo items.

Anyone in Equinor are authorized to use the API.
 * Click **Authorize** to login and start testing.

### Resources
 * [Docs](https://equinor.github.io/template-fastapi-react/)
 * [Github](https://github.com/equinor/template-fastapi-react)

 For questions about usage or expanding the API, create issue on Github or see docs.
"""


def create_app() -> FastAPI:
    public_routes = APIRouter()
    public_routes.include_router(health_check_feature.router)

    authenticated_routes = APIRouter()
    authenticated_routes.include_router(todo_feature.router)
    authenticated_routes.include_router(whoami_feature.router)

    middleware = [Middleware(LocalLoggerMiddleware)]
    if config.APPINSIGHTS_CONSTRING:
        middleware.append(Middleware(OpenCensusRequestLoggingMiddleware))

    app = FastAPI(
        title="Template FastAPI React",
        version="1.4.0",  # x-release-please-version
        description=description_md,
        responses=responses,
        middleware=middleware,
        license_info={"name": "MIT", "url": "https://github.com/equinor/template-fastapi-react/blob/main/LICENSE.md"},
        swagger_ui_init_oauth={
            "clientId": config.OAUTH_CLIENT_ID,
            "appName": "TemplateFastAPIReact",
            "usePkceWithAuthorizationCodeGrant": True,
            "scopes": config.OAUTH_AUTH_SCOPE,
            "useBasicAuthenticationWithAccessCodeGrant": True,
        },
    )

    add_exception_handlers(app)

    app.include_router(authenticated_routes, dependencies=[Security(auth_with_jwt)])
    app.include_router(public_routes)

    return app


@click.group()
def cli():
    pass


@cli.command()
def run():
    import uvicorn

    uvicorn.run(
        "app:create_app",
        host="0.0.0.0",  # nosec
        port=5000,
        factory=True,
        reload=config.ENVIRONMENT == "local",
        log_level=config.LOGGER_LEVEL.lower(),
    )


if __name__ == "__main__":
    cli()  # run commands in cli() group
