import datetime
from typing import Dict, Any, Optional
from models import Patient, Consultation

# Helper to format datetime safely for FHIR (ISO-8601 format)
def _format_datetime(dt: Optional[datetime.datetime]) -> Optional[str]:
    if not dt:
        return None
    # Ensure UTC 'Z' or timezone offset is correctly represented
    return dt.isoformat() + "Z" if not dt.tzinfo else dt.isoformat()

def generate_patient_resource(patient: Patient) -> Dict[str, Any]:
    """
    Generates a FHIR R4 Patient Resource from a database Patient model.
    
    Example Output:
    {
      "resourceType": "Patient",
      "id": "1",
      "active": true,
      "identifier": [
        {
          "system": "https://ndhm.gov.in/abha",
          "value": "91-1234-5678-9012"
        }
      ],
      "name": [
        {
          "use": "official",
          "text": "Jane Doe",
          "family": "Doe",
          "given": ["Jane"]
        }
      ],
      "gender": "female",
      "birthDate": "1980-05-15",
      "telecom": [
        {"system": "phone", "value": "+919876543210", "use": "mobile"},
        {"system": "email", "value": "jane.doe@example.com", "use": "home"}
      ],
      "address": [
        {"text": "123 Main St, New Delhi, India"}
      ]
    }
    """
    # Map gender safely (FHIR R4 codes: male, female, other, unknown)
    gender_map = {
        "male": "male",
        "female": "female",
        "other": "other",
        "m": "male",
        "f": "female",
        "o": "other"
    }
    fhir_gender = gender_map.get(str(patient.gender).lower().strip(), "unknown")

    resource = {
        "resourceType": "Patient",
        "id": str(patient.id),
        "active": True,
        "identifier": [
            {
                "system": "https://ndhm.gov.in/abha",
                "value": patient.abha_number
            }
        ],
        "name": [
            {
                "use": "official",
                "text": patient.full_name,
                "family": patient.last_name,
                "given": [patient.first_name]
            }
        ],
        "gender": fhir_gender,
        "birthDate": patient.date_of_birth.isoformat() if hasattr(patient.date_of_birth, "isoformat") else str(patient.date_of_birth)
    }

    # Add optional contacts if present
    telecoms = []
    if patient.phone:
        telecoms.append({"system": "phone", "value": patient.phone, "use": "mobile"})
    if patient.email:
        telecoms.append({"system": "email", "value": patient.email, "use": "home"})
    if telecoms:
        resource["telecom"] = telecoms

    if patient.address:
        resource["address"] = [{"text": patient.address}]

    return resource


def generate_encounter_resource(consultation: Consultation, patient: Patient) -> Dict[str, Any]:
    """
    Generates a FHIR R4 Encounter Resource representing a single consultation.
    
    Example Output:
    {
      "resourceType": "Encounter",
      "id": "101",
      "status": "finished",
      "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "AMB",
        "display": "ambulatory"
      },
      "subject": {
        "reference": "Patient/1",
        "display": "Jane Doe"
      },
      "period": {
        "start": "2026-06-10T23:58:23Z",
        "end": "2026-06-10T23:58:23Z"
      },
      "reasonCode": [
        {
          "text": "Chest pain radiating to left arm"
        }
      ]
    }
    """
    start_time = _format_datetime(consultation.consultation_date)

    return {
        "resourceType": "Encounter",
        "id": str(consultation.id),
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
        },
        "subject": {
            "reference": f"Patient/{patient.id}",
            "display": patient.full_name
        },
        "period": {
            "start": start_time,
            "end": start_time
        },
        "reasonCode": [
            {
                "text": consultation.symptoms
            }
        ]
    }


def generate_condition_resource(consultation: Consultation, patient: Patient) -> Dict[str, Any]:
    """
    Generates a FHIR R4 Condition Resource mapping the AI-suggested diagnostic codes.
    
    Example Output:
    {
      "resourceType": "Condition",
      "id": "cond-101",
      "clinicalStatus": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
            "code": "active"
          }
        ]
      },
      "verificationStatus": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            "code": "provisional"
          }
        ]
      },
      "category": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-category",
              "code": "encounter-diagnosis",
              "display": "Encounter Diagnosis"
            }
          ]
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": "I20.9",
            "display": "Angina pectoris, unspecified"
          },
          {
            "system": "http://snomed.info/sct",
            "code": "426396005",
            "display": "Cardiac chest pain"
          }
        ],
        "text": "Angina pectoris / Cardiac chest pain"
      },
      "subject": {
        "reference": "Patient/1"
      },
      "encounter": {
        "reference": "Encounter/101"
      },
      "recordedDate": "2026-06-10T23:58:23Z"
    }
    """
    codings = []
    display_names = []

    # Map ICD-10
    if consultation.icd10_code:
        codings.append({
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": consultation.icd10_code,
            "display": consultation.icd10_description or "ICD-10 Condition"
        })
        display_names.append(consultation.icd10_description or consultation.icd10_code)

    # Map SNOMED-CT
    if consultation.snomed_code:
        codings.append({
            "system": "http://snomed.info/sct",
            "code": consultation.snomed_code,
            "display": consultation.snomed_description or "SNOMED Condition"
        })
        display_names.append(consultation.snomed_description or consultation.snomed_code)

    code_text = " / ".join(display_names) if display_names else "Unspecified Diagnosis"

    return {
        "resourceType": "Condition",
        "id": f"cond-{consultation.id}",
        "clinicalStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": "active"
                }
            ]
        },
        "verificationStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    "code": "provisional"
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code": "encounter-diagnosis",
                        "display": "Encounter Diagnosis"
                    }
                ]
            }
        ],
        "code": {
            "coding": codings,
            "text": code_text
        },
        "subject": {
            "reference": f"Patient/{patient.id}"
        },
        "encounter": {
            "reference": f"Encounter/{consultation.id}"
        },
        "recordedDate": _format_datetime(consultation.created_at)
    }


def generate_observation_resource(patient: Patient) -> Dict[str, Any]:
    """
    Generates a FHIR R4 Observation Resource representing the Patient's Risk Assessment Score.
    
    Example Output:
    {
      "resourceType": "Observation",
      "id": "risk-score-1",
      "status": "final",
      "category": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "survey",
              "display": "Survey"
            }
          ]
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "441829007",
            "display": "Cardiovascular disease risk assessment"
          }
        ],
        "text": "Cardiovascular & Metabolic Disease Risk Score"
      },
      "subject": {
        "reference": "Patient/1"
      },
      "effectiveDateTime": "2026-06-10T23:58:23Z",
      "valueQuantity": {
        "value": 45.5,
        "unit": "%",
        "system": "http://unitsofmeasure.org",
        "code": "%"
      },
      "interpretation": [
        {
          "text": "High Risk"
        }
      ]
    }
    """
    # Interpretation mapping based on classification
    risk_class = patient.risk_classification or "Low"
    
    return {
        "resourceType": "Observation",
        "id": f"risk-score-{patient.id}",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "survey",
                        "display": "Survey"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "441829007",
                    "display": "Cardiovascular disease risk assessment"
                }
            ],
            "text": "Cardiovascular & Metabolic Disease Risk Score"
        },
        "subject": {
            "reference": f"Patient/{patient.id}"
        },
        "effectiveDateTime": _format_datetime(patient.updated_at),
        "valueQuantity": {
            "value": patient.risk_score,
            "unit": "%",
            "system": "http://unitsofmeasure.org",
            "code": "%"
        },
        "interpretation": [
            {
                "text": f"{risk_class} Risk"
            }
        ]
    }
