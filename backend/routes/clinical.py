from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

from database import get_db
from models import Patient, Consultation
from services.clinical_assistant import ClinicalAssistantService
from services.snomed_icd_service import SnomedIcdService
from services.audit_service import AuditService

router = APIRouter(prefix="/clinical", tags=["Clinical Operations"])

# Initialize services
clinical_assistant_service = ClinicalAssistantService()
coding_service = SnomedIcdService()

# --- Pydantic Schemas ---
class SymptomCheckRequest(BaseModel):
    patient_id: int = Field(..., example=1)
    symptoms: str = Field(..., min_length=10, example="Severe headache, blurred vision, and nausea for 2 days.")

class SymptomCheckResponse(BaseModel):
    consultation_id: int
    primary_concern: str
    clinical_summary: str
    urgency_level: str
    icd10_code: Optional[str]
    icd10_description: Optional[str]
    snomed_code: Optional[str]
    snomed_description: Optional[str]
    updated_patient_risk_score: float
    updated_patient_risk_classification: str

class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    consultation_date: datetime
    symptoms: str
    clinical_notes: Optional[str]
    icd10_code: Optional[str]
    icd10_description: Optional[str]
    snomed_code: Optional[str]
    snomed_description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Helper to calculate patient age ---
def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


# --- Endpoints ---

@router.post("/symptom-check", response_model=SymptomCheckResponse, status_code=status.HTTP_201_CREATED)
async def submit_symptoms(request: SymptomCheckRequest, db: Session = Depends(get_db)):
    """
    Submits patient symptoms to the Clinical Assistant Service:
    - Runs AI-driven symptom analysis via Mistral AI.
    - Maps conditions to ICD-10 and SNOMED-CT schemas.
    - Computes and updates patient risk metrics in the database.
    - Saves the clinical Encounter/Consultation record.
    - Audits the event.
    """
    # 1. Fetch patient
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {request.patient_id} not found."
        )

    # Log initiation
    AuditService.log_activity(
        db=db,
        action="SYMPTOM_CHECK_START",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Initiated symptom check. Symptoms: {request.symptoms[:100]}..."
    )

    # 2. Analyze symptoms using Mistral AI
    analysis_result = await clinical_assistant_service.analyze_symptoms(request.symptoms)

    # 3. Resolve & reinforce ICD-10 and SNOMED mappings
    # If the AI provided mappings, use them; otherwise resolve using local coding service
    primary_concern = analysis_result.get("primary_concern", "Unspecified symptoms")
    icd10_info = analysis_result.get("icd10_mapping", {})
    snomed_info = analysis_result.get("snomed_mapping", {})

    icd10_code = icd10_info.get("code")
    icd10_desc = icd10_info.get("description")
    snomed_code = snomed_info.get("code")
    snomed_desc = snomed_info.get("description")

    # If coding mappings are missing from AI output, lookup locally
    if not icd10_code or not snomed_code:
        local_mapping = coding_service.map_clinical_text(primary_concern)
        icd10_code = icd10_code or local_mapping.get("icd10_code")
        icd10_desc = icd10_desc or local_mapping.get("icd10_description")
        snomed_code = snomed_code or local_mapping.get("snomed_code")
        snomed_desc = snomed_desc or local_mapping.get("snomed_description")

    # 4. Generate risk score update
    # Build current patient physiological context package for the risk engine
    patient_context = {
        "age": calculate_age(patient.date_of_birth),
        "gender": patient.gender,
        "symptoms": request.symptoms,
        "primary_concern": primary_concern,
        # Check if they have past conditions suggesting hypertension/hyperlipidemia
        "has_cardiac_history": db.query(Consultation).filter(
            Consultation.patient_id == patient.id,
            Consultation.icd10_code.like("I%") # Cardiac range codes
        ).count() > 0
    }

    risk_result = await clinical_assistant_service.calculate_risk_score(patient_context)
    new_risk_score = risk_result.get("risk_score", 0.0)
    new_risk_class = risk_result.get("risk_classification", "Low")

    # Update patient record with latest calculated risk parameters
    patient.risk_score = new_risk_score
    patient.risk_classification = new_risk_class
    patient.updated_at = datetime.now(timezone.utc)

    # 5. Store Consultation record
    db_consultation = Consultation(
        patient_id=patient.id,
        symptoms=request.symptoms,
        clinical_notes=analysis_result.get("clinical_summary", "Consultation conducted by AI Assistant"),
        icd10_code=icd10_code,
        icd10_description=icd10_desc,
        snomed_code=snomed_code,
        snomed_description=snomed_desc
    )
    
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)

    # 6. Log final audit log
    AuditService.log_activity(
        db=db,
        action="SYMPTOM_CHECK_COMPLETE",
        performed_by="Clinician User",
        patient_id=patient.id,
        details={
            "consultation_id": db_consultation.id,
            "primary_concern": primary_concern,
            "urgency": analysis_result.get("urgency_level"),
            "risk_score": new_risk_score
        }
    )

    return SymptomCheckResponse(
        consultation_id=db_consultation.id,
        primary_concern=primary_concern,
        clinical_summary=db_consultation.clinical_notes,
        urgency_level=analysis_result.get("urgency_level", "Low"),
        icd10_code=db_consultation.icd10_code,
        icd10_description=db_consultation.icd10_description,
        snomed_code=db_consultation.snomed_code,
        snomed_description=db_consultation.snomed_description,
        updated_patient_risk_score=patient.risk_score,
        updated_patient_risk_classification=patient.risk_classification
    )


@router.get("/history/{patient_id}", response_model=List[ConsultationResponse])
def get_consultation_history(patient_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the chronological list of historical consultations for a patient.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    consultations = (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.consultation_date.desc())
        .all()
    )

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="VIEW_CONSULTATION_HISTORY",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Retrieved {len(consultations)} consultations for Patient ID {patient_id}."
    )

    return consultations
