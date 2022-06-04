import datetime

import requests
from cachetools import TTLCache, cached
from fastapi import Security
from fastapi.security import APIKeyHeader, OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
from starlette import status
from starlette.exceptions import HTTPException

from authentication.mock_token_generator import mock_rsa_public_key
from authentication.models import User
from common.exceptions import credentials_exception
from config import config, default_user
from features.personal_access_token.interfaces.PersonalAccessTokenRepositoryInterface import (
    PersonalAccessTokenRepositoryInterface,
)
from infrastructure.repositories.PersonalAccessTokenRepository import (
    PersonalAccessTokenRepository,
)
from common.utils.logger import logger

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=config.OAUTH_AUTH_ENDPOINT, tokenUrl=config.OAUTH_TOKEN_ENDPOINT
)

oauth2_scheme_optional_header = OAuth2AuthorizationCodeBearer(
    authorizationUrl=config.OAUTH_AUTH_ENDPOINT,
    tokenUrl=config.OAUTH_TOKEN_ENDPOINT,
    auto_error=False,
)


@cached(cache=TTLCache(maxsize=32, ttl=86400))
def fetch_openid_configuration() -> dict:
    try:
        oid_conf_response = requests.get(config.OAUTH_WELL_KNOWN)
        oid_conf_response.raise_for_status()
        oid_conf = oid_conf_response.json()
        json_web_key_set_response = requests.get(oid_conf["jwks_uri"])
        json_web_key_set_response.raise_for_status()
        return {
            "authorization_endpoint": oid_conf["authorization_endpoint"],
            "token_endpoint": oid_conf["token_endpoint"],
            "jwks": json_web_key_set_response.json()["keys"],
        }
    except Exception as error:
        logger.error(
            f"Failed to fetch OpenId Connect configuration for '{config.OAUTH_WELL_KNOWN}': {error}"
        )
        raise credentials_exception


def auth_with_jwt(jwt_token: str = Security(oauth2_scheme)) -> User:
    if not config.AUTH_ENABLED:
        return default_user
    # If TEST_TOKEN is true, we are running tests. Use the self-signed keys. If not, get keys from auth server.
    key = (
        mock_rsa_public_key
        if config.TEST_TOKEN
        else {"keys": fetch_openid_configuration()["jwks"]}
    )

    try:
        payload = jwt.decode(
            jwt_token, key, algorithms=["RS256"], audience=config.AUTH_AUDIENCE
        )
        if config.MICROSOFT_AUTH_PROVIDER in payload["iss"]:
            # Azure AD uses an oid string to uniquely identify users. Each user has a unique oid value.
            user = User(user_id=payload["oid"], **payload)
        else:
            user = User(user_id=payload["sub"], **payload)
    except JWTError as error:
        logger.warning(error)
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return user


def get_user_from_pat(
    pat: str,
    pat_repository: PersonalAccessTokenRepositoryInterface = PersonalAccessTokenRepository(),
) -> User:
    pat_data = pat_repository.get_by_id(pat)
    if not pat_data:
        raise credentials_exception
    if datetime.datetime.now() > pat_data.expire:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Personal Access Token expired",
            headers={"WWW-Authenticate": "Access-Key"},
        )
    user = User(**pat_data.dict())
    return user


# This dependency function will try to use one of 'Access-Key' or 'Authorization' headers for authentication.
# 'Access-Key' takes precedence.
async def auth_w_jwt_or_pat(
    jwt_token: str = Security(oauth2_scheme_optional_header),
    personal_access_token: str = Security(
        APIKeyHeader(name="Access-Key", auto_error=False)
    ),
) -> User:
    if not config.AUTH_ENABLED:
        return default_user

    if personal_access_token:
        return get_user_from_pat(personal_access_token)
    if jwt_token:
        return auth_with_jwt(jwt_token)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )
