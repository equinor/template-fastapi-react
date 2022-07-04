import functools
import traceback
from typing import Callable, Type, TypeVar

from pydantic import ValidationError
from requests import HTTPError
from starlette import status
from starlette.responses import PlainTextResponse, Response

from common.exceptions import BadRequest, EntityNotFoundException
from common.utils.logger import logger

TResponse = TypeVar("TResponse", bound=Response)


def create_response(response_class: Type[TResponse]) -> Callable[..., Callable[..., TResponse | PlainTextResponse]]:
    def func_wrapper(func) -> Callable[..., TResponse | PlainTextResponse]:
        @functools.wraps(func)
        def wrapper_decorator(*args, **kwargs) -> TResponse | PlainTextResponse:
            try:
                result = func(*args, **kwargs)
                return response_class(result, status_code=200)
            except HTTPError as e:
                logger.error(e)
                return PlainTextResponse(str(e), status_code=e.response.status_code)
            except ValidationError as e:
                logger.error(e)
                return PlainTextResponse(str(e), status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
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
                    "Unexpected unhandled exception",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return wrapper_decorator

    return func_wrapper
