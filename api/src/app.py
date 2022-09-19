import time
from typing import Callable

import click
from fastapi import APIRouter, FastAPI, Security
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from authentication.authentication import auth_with_jwt
from common.exceptions import ErrorResponse
from common.logger import logger
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
    app = FastAPI(title="Awesome Boilerplate", description="", responses=responses)
    app.include_router(authenticated_routes, prefix=prefix, dependencies=[Security(auth_with_jwt)])
    app.include_router(public_routes, prefix=prefix)

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        response: Response = await call_next(request)
        process_time = time.time() - start_time
        milliseconds = int(round(process_time * 1000))
        logger.debug(f"{request.method} {request.url.path} - {milliseconds}ms - {response.status_code}")
        response.headers["X-Process-Time"] = str(process_time)
        return response

    # Intercept FastAPI builtin validation errors, so they can be returned on our standardized format.
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            ErrorResponse(
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                type="RequestValidationError",
                message="The received values are invalid",
                debug="The received values are invalid according to the endpoints model definition",
                extra=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
            ).dict(),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

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
