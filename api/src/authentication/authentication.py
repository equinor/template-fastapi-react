import httpx
import jwt
from cachetools import TTLCache, cached
from fastapi import Security
from fastapi.security import OAuth2AuthorizationCodeBearer

from authentication.mock_token_generator import mock_rsa_public_key
from authentication.models import User
from common.exceptions import credentials_exception
from common.logger import logger
from config import config, default_user

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=config.OAUTH_AUTH_ENDPOINT,
    tokenUrl=config.OAUTH_TOKEN_ENDPOINT,
    auto_error=False,
)


@cached(cache=TTLCache(maxsize=32, ttl=86400))
def fetch_openid_configuration() -> jwt.PyJWKClient:
    try:
        oid_conf_response = httpx.get(config.OAUTH_WELL_KNOWN)
        oid_conf_response.raise_for_status()
        oid_conf = oid_conf_response.json()
        return jwt.PyJWKClient(oid_conf["jwks_uri"])
    except Exception as error:
        logger.error(f"Failed to fetch OpenId Connect configuration for '{config.OAUTH_WELL_KNOWN}': {error}")
        raise credentials_exception


def auth_with_jwt(jwt_token: str = Security(oauth2_scheme)) -> User:
    if not config.AUTH_ENABLED:
        return default_user
    if not jwt_token:
        raise credentials_exception
    # If TEST_TOKEN is true, we are running tests. Use the self-signed keys. If not, get keys from auth server.
    key = (
        mock_rsa_public_key
        if config.TEST_TOKEN
        else fetch_openid_configuration().get_signing_key_from_jwt(jwt_token).key
    )

    try:
        payload = jwt.decode(jwt_token, key, algorithms=["RS256"], audience=config.OAUTH_AUDIENCE)
        if config.MICROSOFT_AUTH_PROVIDER in payload["iss"]:
            # Azure AD uses an oid string to uniquely identify users. Each user has a unique oid value.
            user = User(user_id=payload["oid"], **payload)
        else:
            user = User(user_id=payload["sub"], **payload)
    except jwt.exceptions.InvalidTokenError as error:
        logger.warning(f"Failed to decode JWT: {error}")
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return user
