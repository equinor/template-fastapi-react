from enum import Enum


class LoggerLevel(Enum):
    """Enum containing the different levels for logging."""

    CRITICAL = "critical"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    DEBUG = "debug"
    TRACE = "trace"
