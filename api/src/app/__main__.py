import json

import click

from config import config


@click.group()
def cli() -> None:
    pass


@cli.command()
def run() -> None:
    import uvicorn

    uvicorn.run(
        "app.app:create_app",
        host="0.0.0.0",  # noqa:S104
        port=5000,
        factory=True,
        reload=config.ENVIRONMENT == "local",
        log_level=config.log_level,
    )


@cli.command("open-api")
def open_api() -> None:
    """Generate the OpenAPI specification without starting a server."""
    from app.app import create_app

    app = create_app()
    with open(".openapi.json", "w") as f:
        json.dump(app.openapi(), f, indent=4)
        f.write("\n")


if __name__ == "__main__":
    cli()  # run commands in cli() group
