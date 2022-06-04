"""
Create FastAPI application instance.
"""

import time
from typing import Callable  # for type hinting

import click
import uvicorn
from fastapi import APIRouter, FastAPI
from starlette.requests import Request
from starlette.responses import Response

from config import config
from utils.loggers import logger

server_root = "/api"
version = "v1"
prefix = f"{server_root}/{version}"


def create_app() -> FastAPI:
    """
    Create main app instance, import controllers, add middleware.

    Returns
    -------
    FastAPI
        FastAPI instance with given controllers and middleware.

    """
    from controllers import hello_world

    public_routes = APIRouter()
    public_routes.include_router(hello_world.router)

    app = FastAPI(title="GTS", description="GTS")
    app.include_router(public_routes, prefix=prefix)

    @app.middleware("http")
    async def add_process_time_header(
        request: Request, call_next: Callable
    ) -> Response:
        """
        Add process time header.

        Parameters
        ----------
        request
            Incoming request.
        call_next
            A function that receives request as parameter.
        Returns
        -------
        Response
            Modified response.
        """
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        milliseconds = int(round(process_time * 1000))
        logger.debug(
            f"{request.method} {request.url.path} - {milliseconds}ms - {response.status_code}"
        )
        response.headers["X-Process-Time"] = str(process_time)
        return response

    return app


@click.group()
def cli():
    """
    Click group cli(): run all commands in created group.
    """
    pass


@cli.command()
def run():
    """
    A Click command in the cli group: run create_app with Uvicorn.
    Type python app.py run in command line.
    """
    uvicorn.run(
        "app:create_app",
        host="0.0.0.0",  # nosec
        port=5000,
        reload=config.ENVIRONMENT == "local",
        log_level=config.LOGGER_LEVEL.lower(),
    )


if __name__ == "__main__":
    cli()  # run commands in cli() group
