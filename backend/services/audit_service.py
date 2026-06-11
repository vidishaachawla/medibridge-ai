import logging
import json
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from models import AuditLog

logger = logging.getLogger(__name__)

class AuditService:
    @staticmethod
    def log_activity(
        db: Session,
        action: str,
        performed_by: str = "System",
        patient_id: Optional[int] = None,
        details: Optional[Any] = None
    ) -> AuditLog:
        """
        Records an audit log entry in the PostgreSQL database and writes it to the server logs.
        """
        # Convert dict/list details to JSON string
        details_str = None
        if details is not None:
            if isinstance(details, (dict, list)):
                details_str = json.dumps(details)
            else:
                details_str = str(details)

        # Create database log entry
        db_log = AuditLog(
            action=action.upper(),
            performed_by=performed_by,
            patient_id=patient_id,
            details=details_str
        )
        
        try:
            db.add(db_log)
            db.commit()
            db.refresh(db_log)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to write audit log to database: {e}")
            # Do not raise the exception to prevent breaking the parent request if logging fails,
            # but write a high-severity warning to standard logs.
            
        # Log structured information to standard application logs for log aggregator tracking
        structured_log = {
            "event": "AUDIT_LOG",
            "action": action.upper(),
            "performed_by": performed_by,
            "patient_id": patient_id,
            "details": details
        }
        logger.info(json.dumps(structured_log))
        
        return db_log
