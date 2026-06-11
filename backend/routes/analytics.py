from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any
from pydantic import BaseModel

from database import get_db
from models import Patient, Consultation

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboards"])


# --- Pydantic Response Schemas ---

class RiskDistributionResponse(BaseModel):
    low: int
    medium: int
    high: int
    total: int

class VitalsAveragesResponse(BaseModel):
    avg_systolic: float
    avg_diastolic: float
    avg_heart_rate: float
    avg_bmi: float
    avg_cholesterol: float
    avg_hba1c: float

class ConditionCohortResponse(BaseModel):
    total_patients: int
    diabetes_count: int
    hypertension_count: int
    smoker_count: int
    diabetes_pct: float
    hypertension_pct: float
    smoker_pct: float

class TopConditionsItem(BaseModel):
    icd10_code: str
    icd10_description: str
    count: int

class DashboardSummaryResponse(BaseModel):
    total_patients: int
    total_consultations: int
    high_risk_count: int
    high_risk_pct: float
    avg_risk_score: float
    diabetes_count: int
    hypertension_count: int
    smoker_count: int


# --- Endpoints ---

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns a headline statistics summary for the main dashboard cards:
    - Total patients and consultations
    - High-risk patient count and percentage
    - Average risk score
    - Disease burden counts
    """
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_consultations = db.query(func.count(Consultation.id)).scalar() or 0

    high_risk = db.query(func.count(Patient.id)).filter(
        Patient.risk_classification == "High"
    ).scalar() or 0

    avg_risk = db.query(func.avg(Patient.risk_score)).scalar() or 0.0

    diabetes_count = db.query(func.count(Patient.id)).filter(
        Patient.diabetes_status == True
    ).scalar() or 0

    hypertension_count = db.query(func.count(Patient.id)).filter(
        Patient.hypertension_status == True
    ).scalar() or 0

    smoker_count = db.query(func.count(Patient.id)).filter(
        Patient.smoker_status == True
    ).scalar() or 0

    return DashboardSummaryResponse(
        total_patients=total_patients,
        total_consultations=total_consultations,
        high_risk_count=high_risk,
        high_risk_pct=round((high_risk / total_patients * 100) if total_patients else 0.0, 2),
        avg_risk_score=round(float(avg_risk), 2),
        diabetes_count=diabetes_count,
        hypertension_count=hypertension_count,
        smoker_count=smoker_count
    )


@router.get("/risk-distribution", response_model=RiskDistributionResponse)
def get_risk_distribution(db: Session = Depends(get_db)):
    """
    Returns a breakdown of patients by risk classification tier.
    Suitable for a pie chart or donut chart on the frontend dashboard.
    """
    results = db.query(
        Patient.risk_classification,
        func.count(Patient.id).label("count")
    ).group_by(Patient.risk_classification).all()

    dist = {"Low": 0, "Medium": 0, "High": 0}
    for row in results:
        key = row.risk_classification or "Low"
        if key in dist:
            dist[key] = row.count

    total = sum(dist.values())
    return RiskDistributionResponse(
        low=dist["Low"],
        medium=dist["Medium"],
        high=dist["High"],
        total=total
    )


@router.get("/vitals-averages", response_model=VitalsAveragesResponse)
def get_vitals_averages(db: Session = Depends(get_db)):
    """
    Returns population-level average vitals across all patients.
    Used for comparison baselines and trend charts.
    """
    row = db.query(
        func.avg(Patient.blood_pressure_systolic).label("avg_systolic"),
        func.avg(Patient.blood_pressure_diastolic).label("avg_diastolic"),
        func.avg(Patient.heart_rate).label("avg_heart_rate"),
        func.avg(Patient.bmi).label("avg_bmi"),
        func.avg(Patient.cholesterol).label("avg_cholesterol"),
        func.avg(Patient.hba1c).label("avg_hba1c")
    ).one()

    return VitalsAveragesResponse(
        avg_systolic=round(float(row.avg_systolic or 0), 2),
        avg_diastolic=round(float(row.avg_diastolic or 0), 2),
        avg_heart_rate=round(float(row.avg_heart_rate or 0), 2),
        avg_bmi=round(float(row.avg_bmi or 0), 2),
        avg_cholesterol=round(float(row.avg_cholesterol or 0), 2),
        avg_hba1c=round(float(row.avg_hba1c or 0), 2)
    )


@router.get("/condition-cohorts", response_model=ConditionCohortResponse)
def get_condition_cohorts(db: Session = Depends(get_db)):
    """
    Returns patient counts and percentages for key chronic condition cohorts.
    Used for cohort bar charts and disease burden statistics.
    """
    total = db.query(func.count(Patient.id)).scalar() or 0

    diabetes_count = db.query(func.count(Patient.id)).filter(
        Patient.diabetes_status == True
    ).scalar() or 0

    hypertension_count = db.query(func.count(Patient.id)).filter(
        Patient.hypertension_status == True
    ).scalar() or 0

    smoker_count = db.query(func.count(Patient.id)).filter(
        Patient.smoker_status == True
    ).scalar() or 0

    def pct(n): return round((n / total * 100) if total else 0.0, 2)

    return ConditionCohortResponse(
        total_patients=total,
        diabetes_count=diabetes_count,
        hypertension_count=hypertension_count,
        smoker_count=smoker_count,
        diabetes_pct=pct(diabetes_count),
        hypertension_pct=pct(hypertension_count),
        smoker_pct=pct(smoker_count)
    )


@router.get("/high-risk-patients", response_model=List[Dict[str, Any]])
def get_high_risk_patients(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Returns the top-N highest risk patients sorted by descending risk score.
    Used to populate a priority patient watchlist widget on the dashboard.
    """
    patients = (
        db.query(Patient)
        .filter(Patient.risk_classification == "High")
        .order_by(Patient.risk_score.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": p.id,
            "full_name": p.full_name,
            "abha_number": p.abha_number,
            "risk_score": p.risk_score,
            "risk_classification": p.risk_classification,
            "diabetes_status": p.diabetes_status,
            "hypertension_status": p.hypertension_status,
            "smoker_status": p.smoker_status,
            "blood_pressure": p.bp_display,
            "hba1c": p.hba1c
        }
        for p in patients
    ]


@router.get("/top-conditions", response_model=List[TopConditionsItem])
def get_top_conditions(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns the most frequently recorded ICD-10 diagnoses across all consultations.
    Used for a ranked bar chart of common conditions in the population.
    """
    results = (
        db.query(
            Consultation.icd10_code,
            Consultation.icd10_description,
            func.count(Consultation.id).label("count")
        )
        .filter(Consultation.icd10_code != None)
        .group_by(Consultation.icd10_code, Consultation.icd10_description)
        .order_by(func.count(Consultation.id).desc())
        .limit(limit)
        .all()
    )

    return [
        TopConditionsItem(
            icd10_code=row.icd10_code,
            icd10_description=row.icd10_description or "Unknown",
            count=row.count
        )
        for row in results
    ]


@router.get("/age-risk-buckets", response_model=List[Dict[str, Any]])
def get_age_risk_buckets(db: Session = Depends(get_db)):
    """
    Returns average risk scores grouped into age buckets (18-34, 35-49, 50-64, 65+).
    Used for a grouped bar chart correlating age and cardiovascular risk.
    """
    from sqlalchemy import extract

    current_year = 2026
    rows = db.query(
        case(
            (func.date_part("year", func.current_date()) - func.date_part("year", Patient.date_of_birth) < 35, "18-34"),
            (func.date_part("year", func.current_date()) - func.date_part("year", Patient.date_of_birth) < 50, "35-49"),
            (func.date_part("year", func.current_date()) - func.date_part("year", Patient.date_of_birth) < 65, "50-64"),
            else_="65+"
        ).label("age_group"),
        func.count(Patient.id).label("count"),
        func.avg(Patient.risk_score).label("avg_risk")
    ).group_by("age_group").all()

    return [
        {
            "age_group": row.age_group,
            "count": row.count,
            "avg_risk_score": round(float(row.avg_risk or 0), 2)
        }
        for row in rows
    ]
