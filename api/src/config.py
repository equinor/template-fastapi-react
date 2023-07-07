from pydantic import Field
from pydantic_settings import BaseSettings

from authentication.models import User


class Config(BaseSettings):
    # Pydantic-settings in pydantic v2 automatically fetch config settings from env-variables
    ENVIRONMENT: str = "local"

    # Logging
    LOGGER_LEVEL: str = Field("INFO", validation_alias="LOGGING_LEVEL", to_lower=True)
    APPINSIGHTS_CONSTRING: str | None = None

    # Database
    MONGODB_USERNAME: str = "dummy"
    MONGODB_PASSWORD: str = "dummy"
    MONGODB_HOSTNAME: str = "db"
    MONGODB_DATABASE: str = "test"
    MONGODB_PORT: int = 27017

    # Access control
    APPLICATION_ADMIN: str = "admin"
    APPLICATION_ADMIN_ROLE: str = "admin"

    # Authentication
    SECRET_KEY: str | None = None
    AUTH_ENABLED: bool = False
    JWT_SELF_SIGNING_ISSUER: str = "APPLICATION"  # Which value will be used to sign self-signed JWT's
    TEST_TOKEN: bool = False  # This value should only be changed at runtime by test setup
    OAUTH_WELL_KNOWN: str | None = None
    OAUTH_TOKEN_ENDPOINT: str = ""
    OAUTH_AUTH_ENDPOINT: str = ""
    OAUTH_CLIENT_ID: str = ""
    OAUTH_AUTH_SCOPE: str = ""
    AUTH_AUDIENCE: str = ""
    MICROSOFT_AUTH_PROVIDER: str = "login.microsoftonline.com"


config = Config()  # type: ignore[call-arg]

if config.AUTH_ENABLED and not all((config.OAUTH_AUTH_ENDPOINT, config.OAUTH_TOKEN_ENDPOINT, config.OAUTH_WELL_KNOWN)):
    raise ValueError("Authentication was enabled, but some auth configuration parameters are missing")

if not config.AUTH_ENABLED:
    print("################ WARNING ################")
    print("#       Authentication is disabled      #")
    print("################ WARNING ################\n")

default_user: User = User(
    **{
        "user_id": "nologin",
        "full_name": "Not Authenticated",
        "email": "nologin@example.com",
    }
)
