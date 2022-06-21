import traceback
from typing import Callable

from pydantic import ValidationError
from requests import HTTPError
from starlette import status
from starlette.responses import PlainTextResponse

from common.exceptions import BadRequest, EntityNotFoundException
from common.utils.logger import logger


def use_case_executor(use_case: Callable, *args, **kwargs):
    try:
        return use_case(*args, **kwargs)
    except HTTPError as e:
        logger.error(e)
        return PlainTextResponse(str(e), status_code=e.response.status_code)
    except ValidationError as e:
        logger.error(e)
        return PlainTextResponse(
            str(e), status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    except EntityNotFoundException as e:
        logger.error(e)
        return PlainTextResponse(str(e), status_code=status.HTTP_404_NOT_FOUND)
    except BadRequest as e:
        logger.error(e)
        return PlainTextResponse(str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        traceback.print_exc()
        logger.error(f"Unexpected unhandled exception: {e}")
        return PlainTextResponse(
            "Unexpected unhandled exception", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
