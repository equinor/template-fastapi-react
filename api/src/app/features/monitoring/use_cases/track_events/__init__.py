import datetime
import functools
from http import HTTPStatus
from typing import Any, NotRequired, TypedDict

from azure.monitor.opentelemetry.exporter import AzureMonitorTraceExporter
from azure.monitor.opentelemetry.exporter._connection_string_parser import ConnectionStringParser
from azure.monitor.opentelemetry.exporter._generated.exporter.models import MonitorBase, TelemetryItem

from app.authentication.models import User
from app.common.logger import logger
from app.config import config


@functools.lru_cache(maxsize=1)
def get_trace_exporter() -> AzureMonitorTraceExporter:
    # Mirror CoreDM: when a service principal is fully configured
    # (AZURE_TENANT_ID + OAUTH_CLIENT_ID + OAUTH_CLIENT_SECRET) build a
    # ClientSecretCredential so ingestion works even on App Insights
    # resources with "Local Authentication" disabled. Otherwise fall back
    # to instrumentation-key auth from the connection string.
    kwargs: dict[str, Any] = {
        "connection_string": config.APPINSIGHTS_CONSTRING,
        "logger_name": "API",
    }
    if config.has_azure_service_principal:
        from azure.identity import ClientSecretCredential

        kwargs["credential"] = ClientSecretCredential(
            tenant_id=config.AZURE_TENANT_ID,
            client_id=config.OAUTH_CLIENT_ID,
            client_secret=config.OAUTH_CLIENT_SECRET.get_secret_value(),
        )
    return AzureMonitorTraceExporter(**kwargs)


class EventData(TypedDict):
    ver: int
    properties: dict[str, Any]
    name: str
    url: NotRequired[str]
    measurements: NotRequired[dict[str, float]]


class MetricsData(TypedDict):
    ver: int
    metrics: list[dict[str, Any]]
    properties: dict[str, Any]


class ExceptionData(TypedDict):
    ver: int
    exceptions: list[dict[str, Any]]
    properties: dict[str, Any]


class EventBase(TypedDict):
    baseType: str
    baseData: EventData | MetricsData | ExceptionData


class Event(TypedDict):
    name: str
    tags: dict[str, str]
    time: datetime.datetime
    data: EventBase


class TelemetryErrorDetails(TypedDict):
    index: int
    statusCode: int
    message: str


class TelemetryResult(TypedDict):
    items_received: int
    items_accepted: int
    errors: list[TelemetryErrorDetails]


def track_events_use_case(user: User, events: list[Event]) -> TelemetryResult | None:
    if connection_string := config.APPINSIGHTS_CONSTRING:
        instrumentation_key = ConnectionStringParser(connection_string=connection_string).instrumentation_key
    else:
        logger.warning("Environment variable 'APPINSIGHTS_CONSTRING' is unset; Unable to send to Azure Monitor")
        return TelemetryResult(
            items_accepted=0,
            items_received=len(events),
            errors=[
                TelemetryErrorDetails(
                    index=idx,
                    statusCode=HTTPStatus.UNAUTHORIZED,
                    message="No Applications Insight connection string provided",
                )
                for idx in range(len(events))
            ],
        )
    telemetry_items = [
        TelemetryItem(
            name=event["name"],
            instrumentation_key=instrumentation_key,
            tags=event["tags"],
            time=event["time"],
            data=MonitorBase(event["data"]),
        )
        for event in events
    ]
    trace_exporter = get_trace_exporter()
    try:
        result = trace_exporter.client.track(telemetry_items)
        # The Azure Monitor SDK returns the ingestion response with
        # camelCase keys (`itemsReceived`, `itemsAccepted`, `appId`,
        # `errors`). Remap to the snake_case shape declared by
        # `TelemetryResult` so FastAPI's response validation passes and
        # generated SDK clients see the documented field names.
        raw = result.as_dict()
        return TelemetryResult(
            items_received=raw.get("itemsReceived", len(events)),
            items_accepted=raw.get("itemsAccepted", 0),
            errors=raw.get("errors", []),
        )
    except Exception as e:
        logger.error(f"Failed to track events: {e}")
    return None


__all__ = ["track_events_use_case", "Event", "TelemetryResult"]
