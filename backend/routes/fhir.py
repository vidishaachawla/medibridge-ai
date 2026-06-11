from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timezone

from database import get_db
from models import Patient, Consultation
from services.audit_service import AuditService
import fhir_utils

router = APIRouter(prefix="/fhir", tags=["FHIR Resources"])

# --- Endpoints ---

@router.get("/Patient/{patient_id}", response_model=Dict[str, Any])
def get_fhir_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the FHIR R4 Patient representation for a patient.
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
        action="EXPORT_FHIR_PATIENT",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Exported Patient ID {patient_id} demographics as FHIR resource."
    )

    return fhir_utils.generate_patient_resource(patient)


@router.get("/Observation/risk-score/{patient_id}", response_model=Dict[str, Any])
def get_fhir_observation(patient_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the FHIR R4 Observation resource representing the patient's cardiovascular risk score.
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
        action="EXPORT_FHIR_OBSERVATION",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Exported Patient ID {patient_id} risk assessment observation as FHIR resource."
    )

    return fhir_utils.generate_observation_resource(patient)


@router.get("/Encounter/{consultation_id}", response_model=Dict[str, Any])
def get_fhir_encounter(consultation_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the FHIR R4 Encounter resource for a given consultation session.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found."
        )
        
    patient = db.query(Patient).filter(Patient.id == consultation.patient_id).first()

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="EXPORT_FHIR_ENCOUNTER",
        performed_by="Clinician User",
        patient_id=patient.id if patient else None,
        details=f"Exported Consultation ID {consultation_id} as FHIR Encounter."
    )

    return fhir_utils.generate_encounter_resource(consultation, patient)


@router.get("/Condition/{consultation_id}", response_model=Dict[str, Any])
def get_fhir_condition(consultation_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the FHIR R4 Condition representation for the diagnostic mappings of a consultation.
    """
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation with ID {consultation_id} not found."
        )
        
    patient = db.query(Patient).filter(Patient.id == consultation.patient_id).first()

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="EXPORT_FHIR_CONDITION",
        performed_by="Clinician User",
        patient_id=patient.id if patient else None,
        details=f"Exported Consultation ID {consultation_id} diagnostic coding as FHIR Condition."
    )

    return fhir_utils.generate_condition_resource(consultation, patient)


@router.get("/Patient/{patient_id}/bundle", response_model=Dict[str, Any])
def get_fhir_bundle(patient_id: int, db: Session = Depends(get_db)):
    """
    Exports a complete patient electronic medical record as a FHIR R4 Transaction/Collection Bundle.
    Combines:
    - Patient resource
    - Vitals/Risk Assessment Observation resource
    - All Encounter resources (each consultation)
    - All Condition resources (associated diagnostic codes)
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    entries = []

    # 1. Add Patient Resource
    patient_res = fhir_utils.generate_patient_resource(patient)
    entries.append({
        "fullUrl": f"urn:uuid:patient-{patient.id}",
        "resource": patient_res
    })

    # 2. Add Risk Assessment Observation Resource
    observation_res = fhir_utils.generate_observation_resource(patient)
    entries.append({
        "fullUrl": f"urn:uuid:observation-risk-{patient.id}",
        "resource": observation_res
    })

    # 3. Add all Encounters and Conditions
    consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).all()
    for c in consultations:
        encounter_res = fhir_utils.generate_encounter_resource(c, patient)
        entries.append({
            "fullUrl": f"urn:uuid:encounter-{c.id}",
            "resource": encounter_res
        })

        if c.icd10_code or c.snomed_code:
            condition_res = fhir_utils.generate_condition_resource(c, patient)
            entries.append({
                "fullUrl": f"urn:uuid:condition-{c.id}",
                "resource": condition_res
            })

    # Assemble FHIR Bundle
    bundle = {
        "resourceType": "Bundle",
        "id": f"bundle-patient-{patient.id}",
        "type": "collection",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entry": entries
    }

    # Audit logging
    AuditService.log_activity(
        db=db,
        action="EXPORT_FHIR_BUNDLE",
        performed_by="Clinician User",
        patient_id=patient.id,
        details=f"Exported complete electronic record for Patient ID {patient.id} containing {len(entries)} FHIR entries."
    )

    return bundle
