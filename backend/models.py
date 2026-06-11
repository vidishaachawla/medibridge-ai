from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text,
    DateTime, ForeignKey, Date, Boolean
)
from sqlalchemy.orm import relationship
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Identity ---
    abha_number = Column(String(17), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)
    phone = Column(String(15), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)

    # --- Vitals & Clinical Metrics (NEW) ---
    blood_pressure_systolic = Column(Integer, nullable=True)    # mmHg
    blood_pressure_diastolic = Column(Integer, nullable=True)   # mmHg
    heart_rate = Column(Integer, nullable=True)                 # bpm
    bmi = Column(Float, nullable=True)                          # kg/m²
    cholesterol = Column(Float, nullable=True)                  # mg/dL (total)
    hba1c = Column(Float, nullable=True)                        # % (HbA1c)

    # --- Condition Flags (NEW) ---
    smoker_status = Column(Boolean, default=False, nullable=False)
    diabetes_status = Column(Boolean, default=False, nullable=False)
    hypertension_status = Column(Boolean, default=False, nullable=False)

    # --- Risk Assessment ---
    risk_score = Column(Float, default=0.0)
    risk_classification = Column(String(20), default="Low")  # Low / Medium / High

    # --- Timestamps ---
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # --- Relationships ---
    consultations = relationship(
        "Consultation", back_populates="patient", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="patient", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def bp_display(self) -> str:
        """Returns blood pressure as a formatted string."""
        if self.blood_pressure_systolic and self.blood_pressure_diastolic:
            return f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic} mmHg"
        return "N/A"


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False
    )
    consultation_date = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # --- Clinical Input & AI Reasoning ---
    symptoms = Column(Text, nullable=False)
    clinical_notes = Column(Text, nullable=True)

    # --- Medical Coding ---
    icd10_code = Column(String(20), nullable=True)
    icd10_description = Column(String(255), nullable=True)
    snomed_code = Column(String(50), nullable=True)
    snomed_description = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # --- Relationships ---
    patient = relationship("Patient", back_populates="consultations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )
    action = Column(String(50), nullable=False, index=True)
    performed_by = Column(String(100), default="System")
    patient_id = Column(
        Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True
    )
    details = Column(Text, nullable=True)

    # --- Relationships ---
    patient = relationship("Patient", back_populates="audit_logs")
