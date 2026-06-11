from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, date, time
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit Trails"])

# --- Pydantic Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    action: str
    performed_by: str
    patient_id: Optional[int]
    details: Optional[str]

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter logs by exact action code, e.g., CREATE_PATIENT"),
    start_date: Optional[date] = Query(None, description="Start date of filtration range (inclusive)", example="2026-06-01"),
    end_date: Optional[date] = Query(None, description="End date of filtration range (inclusive)", example="2026-06-30"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves system audit logs. Supports filter configurations:
    - `action`: filter by action code.
    - `start_date` & `end_date`: filter logs by transaction dates.
    - Paginated by `skip` and `limit`.
    """
    query = db.query(AuditLog)

    # Apply action filter
    if action:
        query = query.filter(AuditLog.action == action.upper())

    # Apply date range filter
    if start_date:
        # Combine date with start of day time
        start_datetime = datetime.combine(start_date, time.min)
        query = query.filter(AuditLog.timestamp >= start_datetime)
        
    if end_date:
        # Combine date with end of day time
        end_datetime = datetime.combine(end_date, time.max)
        query = query.filter(AuditLog.timestamp <= end_datetime)

    # Order by newest first
    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    return logs
