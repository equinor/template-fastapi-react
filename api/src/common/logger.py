"""
Setup API and Uvicorn logger.
"""

import logging

from config import config

uvicorn_logger = logging.getLogger("uvicorn")

logger = logging.getLogger("API")
logger.setLevel(config.log_level.upper())
formatter = logging.Formatter("%(levelname)s:%(asctime)s %(message)s")
channel = logging.StreamHandler()
channel.setFormatter(formatter)
channel.setLevel(config.log_level.upper())
logger.addHandler(channel)
