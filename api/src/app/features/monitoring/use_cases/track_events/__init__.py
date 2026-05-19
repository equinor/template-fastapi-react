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
                    statusCode=HTTPStatus.SERVICE_UNAVAILABLE,
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
        return TelemetryResult(
            items_received=result.items_received or len(events),
            items_accepted=result.items_accepted or 0,
            errors=[
                TelemetryErrorDetails(
                    index=error.index or 0,
                    statusCode=error.status_code or 0,
                    message=error.message or "",
                )
                for error in (result.errors or [])
            ],
        )
    except Exception as e:
        logger.error(f"Failed to track events: {e}")
    return None


__all__ = ["track_events_use_case", "Event", "TelemetryResult"]
