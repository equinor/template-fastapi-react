"""
Configurate base settings.
"""

from pydantic import BaseSettings, Field


class Config(BaseSettings):
    """
    Configurate base settings, set default env variables.
    Inherits from pydantic.BaseSettings.
    """

    ENVIRONMENT: str = Field("local", env="ENVIRONMENT")
    LOGGER_LEVEL: str = Field("INFO", env="LOGGING_LEVEL", to_lower=True)


config = Config()
