from pydantic import BaseSettings, Field
from pydantic.env_settings import SettingsError

from authentication.models import User


class Config(BaseSettings):
    ENVIRONMENT: str = Field("local", env="ENVIRONMENT")
    LOGGER_LEVEL: str = Field("INFO", env="LOGGING_LEVEL", to_lower=True)

    # Database
    MONGODB_USERNAME: str = Field("dummy", env="MONGODB_USERNAME")
    MONGODB_PASSWORD: str = Field("dummy", env="MONGODB_PASSWORD")
    MONGODB_HOSTNAME: str = Field("db", env="MONGODB_HOSTNAME")
    MONGODB_DATABASE: str = Field("test", env="MONGODB_DATABASE")
    MONGODB_PORT: int = Field(27017, env="MONGODB_PORT")

    # Access control
    APPLICATION_ADMIN = Field("admin", env="APPLICATION_ADMIN")
    APPLICATION_ADMIN_ROLE = Field("admin", env="APPLICATION_ADMIN_ROLE")

    # Authentication
    SECRET_KEY: str = Field(None, env="SECRET_KEY")
    AUTH_ENABLED: bool = Field(False, env="AUTH_ENABLED")
    JWT_SELF_SIGNING_ISSUER: str = "APPLICATION"  # Which value will be used to sign self-signed JWT's
    TEST_TOKEN: bool = False  # This value should only be changed at runtime by test setup
    OAUTH_WELL_KNOWN: str = Field(None, env="OAUTH_WELL_KNOWN")
    OAUTH_TOKEN_ENDPOINT: str = Field("", env="OAUTH_TOKEN_ENDPOINT")
    OAUTH_AUTH_ENDPOINT: str = Field("", env="OAUTH_AUTH_ENDPOINT")
    OAUTH_CLIENT_ID = Field("", env="OAUTH_CLIENT_ID")
    OAUTH_AUTH_SCOPE = Field("", env="OAUTH_AUTH_SCOPE")
    AUTH_AUDIENCE: str = Field("", env="OAUTH_AUDIENCE")
    MICROSOFT_AUTH_PROVIDER: str = "login.microsoftonline.com"


config = Config()  # type: ignore[call-arg]

if config.AUTH_ENABLED and not all((config.OAUTH_AUTH_ENDPOINT, config.OAUTH_TOKEN_ENDPOINT, config.OAUTH_WELL_KNOWN)):
    raise SettingsError("Authentication was enabled, but some auth configuration parameters are missing")

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
