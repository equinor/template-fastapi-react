import time

from starlette.datastructures import MutableHeaders

from common.logger import logger


# These middlewares are written as "pure ASGI middleware", see: https://www.starlette.io/middleware/#pure-asgi-middleware
# Middleware inheriting from the "BaseHTTPMiddleware" class does not work with Starlettes BackgroundTasks.
# see: https://github.com/encode/starlette/issues/919
class LocalLoggerMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        start_time = time.time()
        process_time = ""
        path = scope["path"]
        method = scope["method"]
        response = {}

        async def inner_send(message):
            nonlocal process_time
            nonlocal response
            if message["type"] == "http.response.start":
                process_time_ms = time.time() - start_time
                process_time = str(int(round(process_time_ms * 1000)))
                response = message

                headers = MutableHeaders(scope=message)
                headers.append("X-Process-Time", process_time)

            await send(message)

        await self.app(scope, receive, inner_send)
        logger.info(f"{method} {path} - {process_time}ms - {response['status']}")
