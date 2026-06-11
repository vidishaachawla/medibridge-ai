from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

from database import get_db
from models import Patient
from services.abha_service import AbhaService
from services.audit_service import AuditService

router = APIRouter(prefix="/patients", tags=["Patients"])

# --- Pydantic Schemas ---
class PatientBase(BaseModel):
    first_name: str = Field(..., max_length=50, example="Jane")
    last_name: str = Field(..., max_length=50, example="Doe")
    date_of_birth: date = Field(..., example="1985-05-12")
    gender: str = Field(..., max_length=10, example="Female")
    phone: Optional[str] = Field(None, max_length=15, example="+919876543210")
    email: Optional[EmailStr] = Field(None, example="jane.doe@example.com")
    address: Optional[str] = Field(None, example="123 Health Ave, Bangalore")

    # Vitals
    blood_pressure_systolic: Optional[int] = Field(None, ge=60, le=250, example=120)
    blood_pressure_diastolic: Optional[int] = Field(None, ge=40, le=150, example=80)
    heart_rate: Optional[int] = Field(None, ge=30, le=220, example=72)
    bmi: Optional[float] = Field(None, ge=10.0, le=80.0, example=24.5)
    cholesterol: Optional[float] = Field(None, ge=50.0, le=600.0, example=185.0)
    hba1c: Optional[float] = Field(None, ge=3.0, le=20.0, example=5.4)

    # Condition Flags
    smoker_status: bool = Field(False, example=False)
    diabetes_status: bool = Field(False, example=False)
    hypertension_status: bool = Field(False, example=False)

class PatientCreate(PatientBase):
    abha_number: Optional[str] = Field(
        None,
        pattern=r"^\d{2}-\d{4}-\d{4}-\d{4}$",
        description="If empty, a synthetic ABHA ID will be auto-generated.",
        example="91-4567-8901-2345"
    )

class PatientResponse(PatientBase):
    id: int
    abha_number: str
    risk_score: float
    risk_classification: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """
    Creates a new patient. Generates a synthetic ABHA number if none is supplied.
    """
    # Set or generate ABHA number
    abha_number = patient_in.abha_number
    if not abha_number:
        abha_number = AbhaService.generate_abha_number()
    else:
        # Validate provided ABHA number
        if not AbhaService.validate_abha(abha_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ABHA number format. Must match XX-XXXX-XXXX-XXXX."
            )

    # Check if ABHA already exists
    existing_patient = db.query(Patient).filter(Patient.abha_number == abha_number).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A patient with this ABHA number already exists."
        )

    # Save to database
    db_patient = Patient(
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        phone=patient_in.phone,
        email=patient_in.email,
        address=patient_in.address,
        abha_number=abha_number,
        blood_pressure_systolic=patient_in.blood_pressure_systolic,
        blood_pressure_diastolic=patient_in.blood_pressure_diastolic,
        heart_rate=patient_in.heart_rate,
        bmi=patient_in.bmi,
        cholesterol=patient_in.cholesterol,
        hba1c=patient_in.hba1c,
        smoker_status=patient_in.smoker_status,
        diabetes_status=patient_in.diabetes_status,
        hypertension_status=patient_in.hypertension_status
    )

    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="CREATE_PATIENT",
        performed_by="System Registration",
        patient_id=db_patient.id,
        details=f"Patient registered with ABHA: {db_patient.abha_number}"
    )

    return db_patient


@router.get("/", response_model=List[PatientResponse])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieves a paginated list of patients.
    """
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients


@router.get("/search/abha", response_model=PatientResponse)
def search_patient_by_abha(
    abha_number: str = Query(..., pattern=r"^\d{2}-\d{4}-\d{4}-\d{4}$", example="91-1234-5678-9012"),
    db: Session = Depends(get_db)
):
    """
    Searches and retrieves a patient profile using their exact ABHA number.
    """
    patient = db.query(Patient).filter(Patient.abha_number == abha_number).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found with the provided ABHA number."
        )

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="SEARCH_PATIENT_ABHA",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Searched for patient using ABHA ID: {abha_number}"
    )

    return patient


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single patient profile by their database primary ID.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="VIEW_PATIENT_PROFILE",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Accessed Patient ID {patient_id} demographics."
    )

    return patient
