from fastapi import APIRouter, FastAPI, Security
from starlette.middleware import Middleware

from app.authentication import auth_with_jwt
from app.common import LocalLoggerMiddleware, responses
from app.config import config
from app.features.health_check import router as health_check_router
from app.features.monitoring import router as monitoring_router
from app.features.todo import router as todo_router
from app.features.whoami import router as whoami_router

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
    public_routes.include_router(health_check_router)

    authenticated_routes = APIRouter()
    authenticated_routes.include_router(monitoring_router)
    authenticated_routes.include_router(todo_router)
    authenticated_routes.include_router(whoami_router)

    middleware = [Middleware(LocalLoggerMiddleware)]

    app = FastAPI(
        title="Template FastAPI React",
        version="1.4.0",
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

    if config.APPINSIGHTS_CONSTRING:
        from azure.monitor.opentelemetry import configure_azure_monitor
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        # Mirror CoreDM: when a service principal is fully configured
        # (AZURE_TENANT_ID + OAUTH_CLIENT_ID + OAUTH_CLIENT_SECRET) build a
        # ClientSecretCredential so ingestion works even on App Insights
        # resources with "Local Authentication" disabled. Otherwise fall
        # back to instrumentation-key auth from the connection string —
        # the credential-free path that works in dev and CI.
        kwargs: dict[str, object] = {
            "connection_string": config.APPINSIGHTS_CONSTRING,
            "logger_name": "API",
        }
        if config.has_azure_service_principal:
            from azure.identity import ClientSecretCredential

            kwargs["credential"] = ClientSecretCredential(
                tenant_id=config.AZURE_TENANT_ID,
                client_id=config.OAUTH_CLIENT_ID,
                client_secret=config.OAUTH_CLIENT_SECRET.get_secret_value(),
            )
        configure_azure_monitor(**kwargs)
        FastAPIInstrumentor.instrument_app(app, excluded_urls="healthcheck")

    app.include_router(authenticated_routes, dependencies=[Security(auth_with_jwt)])
    app.include_router(public_routes)

    return app
