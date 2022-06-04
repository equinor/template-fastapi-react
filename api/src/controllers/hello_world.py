"""
Router, aka mini FastAPI, and controllers to parse requests.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/hello_world")
def hello_world() -> str:
    """
    Output the message Hello mister!

    Returns
    -------
    str
        Response to /prefix/hello_world.
    """
    return "Hello mister!"
