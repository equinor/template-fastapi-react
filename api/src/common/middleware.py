import time
from typing import Any, Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from common.logger import logger


class TimerHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Any:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        milliseconds = int(round(process_time * 1000))
        logger.debug(f"{request.method} {request.url.path} - {milliseconds}ms - {response.status_code}")
        response.headers["X-Process-Time"] = str(process_time)
        return response
