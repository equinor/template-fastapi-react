import json
import re

import pytest

from common.exception_handlers import (
    fall_back_exception_handler,
    generic_exception_handler,
)
from common.exceptions import (
    BadRequestException,
    ExceptionSeverity,
    MissingPrivilegeException,
)


def test_fall_back_exception_handler(caplog, mock_request):
    exception_response = fall_back_exception_handler(mock_request, exc=ZeroDivisionError())
    exception_response_dict = json.loads(exception_response.body)
    exception_error_id = re.search(r"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}", exception_response_dict["debug"]).group(0)
    assert exception_response_dict["status"] == 500
    assert exception_response_dict["type"] == "ZeroDivisionError"
    assert exception_error_id in caplog.text


@pytest.mark.parametrize(
    "exception, expected_response",
    [
        (
            BadRequestException(),
            {
                "status": 400,
                "type": "BadRequestException",
                "message": "Invalid data for the operation",
                "debug": "Unable to complete the requested operation with the given input values.",
                "extra": None,
            },
        ),
        (
            MissingPrivilegeException(),
            {
                "status": 403,
                "type": "MissingPrivilegeException",
                "message": "You do not have the required permissions",
                "debug": "Action denied because of insufficient permissions",
                "extra": None,
            },
        ),
    ],
)
def test_generic_exception_handler(caplog, mock_request, exception, expected_response):
    exception_response = generic_exception_handler(mock_request, exc=exception)
    assert json.loads(exception_response.body) == expected_response
    if exception.severity == ExceptionSeverity.ERROR:
        assert "ERROR" in caplog.text
    if exception.severity == ExceptionSeverity.WARNING:
        assert "WARNING" in caplog.text
    if exception.severity == ExceptionSeverity.CRITICAL:
        assert "CRITICAL" in caplog.text
