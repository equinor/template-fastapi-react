import time

from azure.core.tracing import SpanKind
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.attributes_helper import COMMON_ATTRIBUTES
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer
from starlette.datastructures import MutableHeaders

from common.logger import logger
from config import config


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


class OpenCensusRequestLoggingMiddleware:
    exporter = AzureExporter(connection_string=config.APPINSIGHTS_CONSTRING) if config.APPINSIGHTS_CONSTRING else None
    sampler = ProbabilitySampler(1.0)

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        tracer = Tracer(exporter=self.exporter, sampler=self.sampler)

        path = scope["path"]
        response = {}

        async def inner_send(message):
            nonlocal response
            if message["type"] == "http.response.start":
                response = message

            await send(message)

        if path == "/health-check":  # Don't send health-check requests to Azure
            return await self.app(scope, receive, send)

        with tracer.span("main") as span:
            span.span_kind = SpanKind.SERVER

            await self.app(scope, receive, inner_send)

            tracer.add_attribute_to_current_span(
                attribute_key=COMMON_ATTRIBUTES["HTTP_STATUS_CODE"], attribute_value=response["status"]
            )
            host = next((header[1].decode() for header in scope["headers"] if header[0] == b"host"), "")
            tracer.add_attribute_to_current_span(
                attribute_key=COMMON_ATTRIBUTES["HTTP_URL"], attribute_value=f"{host}{path}"
            )
