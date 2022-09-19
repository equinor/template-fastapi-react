import click
from fastapi import APIRouter, FastAPI, Security
from fastapi.exceptions import RequestValidationError
from starlette.middleware import Middleware

from authentication.authentication import auth_with_jwt
from common.exception_handlers import validation_exception_handler
from common.middleware import TimerHeaderMiddleware
from common.responses import responses
from config import config
from features.health_check import health_check_feature
from features.todo import todo_feature
from features.whoami import whoami_feature

server_root = "/api"
version = "v1"
prefix = f"{server_root}/{version}"


def create_app() -> FastAPI:
    public_routes = APIRouter()
    public_routes.include_router(health_check_feature.router)

    authenticated_routes = APIRouter()
    authenticated_routes.include_router(todo_feature.router)
    authenticated_routes.include_router(whoami_feature.router)

    middleware = [Middleware(TimerHeaderMiddleware)]

    exception_handlers = {RequestValidationError: validation_exception_handler}

    app = FastAPI(
        title="Awesome Boilerplate",
        responses=responses,
        middleware=middleware,
        exception_handlers=exception_handlers,  # type: ignore
    )

    app.include_router(authenticated_routes, prefix=prefix, dependencies=[Security(auth_with_jwt)])
    app.include_router(public_routes, prefix=prefix)

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
