from fastapi import APIRouter, Depends

from app.authentication.authentication import auth_with_jwt
from app.authentication.models import User
from app.common.exception_handlers import ExceptionHandlingRoute
from app.features.monitoring.use_cases.track_events import Event, TelemetryResult, track_events_use_case

router = APIRouter(tags=["monitoring"], prefix="/monitoring", route_class=ExceptionHandlingRoute)


@router.post("/v2/track", operation_id="track")
async def track(events: list[Event], user: User = Depends(auth_with_jwt)) -> TelemetryResult | None:
    return track_events_use_case(events=events, user=user)
