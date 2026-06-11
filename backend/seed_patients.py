"""
seed_patients.py
----------------
Generates and inserts 1000 synthetic patients into the Neon PostgreSQL database.

Usage:
    python seed_patients.py

Requirements:
    pip install faker
"""

import os
import sys
import random
import logging
from datetime import date, datetime, timedelta, timezone

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from faker import Faker
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import Patient, Consultation
from services.abha_service import AbhaService
from services.snomed_icd_service import SnomedIcdService

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

fake = Faker("en_IN")   # Use Indian locale for realistic names, addresses, phone numbers
coding_service = SnomedIcdService()

# ------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------
TOTAL_PATIENTS = 1000
PATIENTS_WITH_CONSULTATIONS = 400   # 40% of patients will have consultation records
MIN_CONSULTATIONS_PER_PATIENT = 1
MAX_CONSULTATIONS_PER_PATIENT = 5

# Realistic symptom bank keyed to conditions
CONDITION_SYMPTOMS = {
    "essential hypertension": [
        "Persistent headache, dizziness, and blurred vision on waking.",
        "Headache radiating to the back of the neck, occasional nosebleeds.",
        "Fatigue, shortness of breath on mild exertion, and swollen ankles."
    ],
    "type 2 diabetes": [
        "Excessive thirst, frequent urination, and unexplained weight loss.",
        "Blurred vision, slow-healing cuts on the feet, and frequent infections.",
        "Tingling and numbness in hands and feet, excessive fatigue."
    ],
    "common cold": [
        "Runny nose, sneezing, mild sore throat, and low-grade fever.",
        "Nasal congestion, mild cough, and body aches for 3 days.",
        "Sore throat, headache, and watery eyes."
    ],
    "asthma": [
        "Shortness of breath during physical activity, wheezing, and tightness in chest.",
        "Nocturnal cough waking from sleep, difficulty breathing in cold air.",
        "Wheezing, persistent dry cough, and reduced exercise tolerance."
    ],
    "angina pectoris": [
        "Chest tightness and pressure lasting a few minutes during exertion.",
        "Chest pain radiating to the left shoulder during physical activity.",
        "Shortness of breath, chest discomfort, and mild diaphoresis on climbing stairs."
    ],
    "migraine": [
        "Severe unilateral headache with nausea, photophobia, and aura.",
        "Throbbing headache on one side, vomiting, and sensitivity to light and sound.",
        "Pulsating headache preceded by visual disturbances."
    ],
    "generalized anxiety": [
        "Persistent excessive worry, restlessness, difficulty concentrating, and insomnia.",
        "Muscle tension, irritability, fatigue, and inability to relax.",
        "Racing thoughts, sweating, and palpitations without physical exertion."
    ],
    "osteoarthritis": [
        "Joint pain and stiffness in the knees worse in the morning.",
        "Knee and hip aching that worsens after prolonged standing or walking.",
        "Crepitus in joints on movement, reduced range of motion."
    ],
    "hyperlipidemia": [
        "Routine checkup revealed elevated total cholesterol levels.",
        "No symptoms — abnormal blood lipid profile on annual screening.",
        "Xanthelasma around eyelids noted during routine examination."
    ],
    "urinary tract infection": [
        "Burning sensation during urination, frequent urge to urinate, and cloudy urine.",
        "Lower abdominal pain, dysuria, and mild fever.",
        "Foul-smelling urine, increased urgency, and pelvic discomfort."
    ]
}


# ------------------------------------------------------------------
# VITALS GENERATORS — Age-aware realistic values
# ------------------------------------------------------------------

def generate_vitals(age: int, has_hypertension: bool, has_diabetes: bool, is_smoker: bool):
    """Generates physiologically plausible vitals based on the patient's age and conditions."""

    # Blood Pressure (mmHg)
    if has_hypertension:
        systolic = random.randint(135, 180)
        diastolic = random.randint(88, 110)
    elif age > 60:
        systolic = random.randint(125, 155)
        diastolic = random.randint(80, 95)
    else:
        systolic = random.randint(105, 130)
        diastolic = random.randint(65, 85)

    # Heart Rate (bpm)
    if is_smoker:
        heart_rate = random.randint(75, 105)
    else:
        heart_rate = random.randint(58, 90)

    # BMI (kg/m²) — correlated with age slightly
    base_bmi = 22.0
    age_offset = max(0, (age - 30) * 0.08)
    bmi = round(random.gauss(base_bmi + age_offset, 3.5), 1)
    bmi = max(15.0, min(45.0, bmi))

    # Cholesterol (mg/dL)
    if age > 50 or is_smoker:
        cholesterol = round(random.gauss(210, 35), 1)
    else:
        cholesterol = round(random.gauss(185, 30), 1)
    cholesterol = max(120.0, min(380.0, cholesterol))

    # HbA1c (%)
    if has_diabetes:
        hba1c = round(random.uniform(7.2, 12.0), 1)
    elif age > 50:
        hba1c = round(random.uniform(5.4, 6.8), 1)
    else:
        hba1c = round(random.uniform(4.5, 5.8), 1)

    return {
        "blood_pressure_systolic": systolic,
        "blood_pressure_diastolic": diastolic,
        "heart_rate": heart_rate,
        "bmi": bmi,
        "cholesterol": cholesterol,
        "hba1c": hba1c
    }


def calculate_risk_score_local(age, systolic, cholesterol, hba1c, is_smoker, has_diabetes, has_hypertension) -> tuple:
    """
    Fast local risk calculator — avoids async Mistral AI calls during seeding.
    Returns (risk_score: float, classification: str)
    """
    score = 5.0

    # Age contribution
    if age >= 65:
        score += 20.0
    elif age >= 50:
        score += 12.0
    elif age >= 35:
        score += 5.0

    # BP contribution
    if systolic >= 160:
        score += 20.0
    elif systolic >= 140:
        score += 12.0
    elif systolic >= 130:
        score += 6.0

    # Cholesterol
    if cholesterol >= 240:
        score += 12.0
    elif cholesterol >= 200:
        score += 6.0

    # HbA1c
    if hba1c >= 8.0:
        score += 15.0
    elif hba1c >= 6.5:
        score += 8.0
    elif hba1c >= 5.7:
        score += 3.0

    # Condition flags
    if is_smoker:
        score += 15.0
    if has_diabetes:
        score += 10.0
    if has_hypertension:
        score += 8.0

    score = round(min(score, 100.0), 2)

    if score < 20:
        classification = "Low"
    elif score < 50:
        classification = "Medium"
    else:
        classification = "High"

    return score, classification


def random_dob(age: int) -> date:
    """Generates a realistic date of birth from a target age."""
    today = date.today()
    birth_year = today.year - age
    try:
        return date(birth_year, random.randint(1, 12), random.randint(1, 28))
    except ValueError:
        return date(birth_year, 1, 1)


# ------------------------------------------------------------------
# CONDITION PROBABILITY PROFILES (age-based)
# ------------------------------------------------------------------

def assign_conditions(age: int):
    """Returns probabilistic boolean flags for health conditions based on age."""
    hypertension = random.random() < (0.05 if age < 35 else 0.25 if age < 55 else 0.50)
    diabetes = random.random() < (0.03 if age < 35 else 0.12 if age < 55 else 0.22)
    smoker = random.random() < 0.20  # 20% smoking rate

    return hypertension, diabetes, smoker


# ------------------------------------------------------------------
# SEED FUNCTION
# ------------------------------------------------------------------

def seed_patients(db: Session, count: int = TOTAL_PATIENTS):
    existing_count = db.query(Patient).count()
    if existing_count >= count:
        logger.info(f"Database already has {existing_count} patients. Skipping seed.")
        return

    logger.info(f"Seeding {count} synthetic patients...")

    patients_created = []
    abha_set = set()  # Track generated ABHAs to avoid duplicates

    genders = ["Male", "Female", "Other"]
    gender_weights = [0.49, 0.49, 0.02]

    for i in range(count):
        age = random.randint(18, 85)
        gender = random.choices(genders, weights=gender_weights, k=1)[0]

        # Generate a unique ABHA
        while True:
            abha = AbhaService.generate_abha_number()
            if abha not in abha_set:
                abha_set.add(abha)
                break

        # Assign condition flags
        has_hypertension, has_diabetes, is_smoker = assign_conditions(age)

        # Generate realistic vitals
        vitals = generate_vitals(age, has_hypertension, has_diabetes, is_smoker)

        # Calculate risk score locally (fast, no API call)
        risk_score, risk_class = calculate_risk_score_local(
            age=age,
            systolic=vitals["blood_pressure_systolic"],
            cholesterol=vitals["cholesterol"],
            hba1c=vitals["hba1c"],
            is_smoker=is_smoker,
            has_diabetes=has_diabetes,
            has_hypertension=has_hypertension
        )

        # Generate Indian-locale demographics
        if gender == "Female":
            first_name = fake.first_name_female()
        elif gender == "Male":
            first_name = fake.first_name_male()
        else:
            first_name = fake.first_name()

        patient = Patient(
            abha_number=abha,
            first_name=first_name,
            last_name=fake.last_name(),
            date_of_birth=random_dob(age),
            gender=gender,
            phone=fake.phone_number()[:15],
            email=fake.email(),
            address=fake.address()[:250],
            blood_pressure_systolic=vitals["blood_pressure_systolic"],
            blood_pressure_diastolic=vitals["blood_pressure_diastolic"],
            heart_rate=vitals["heart_rate"],
            bmi=vitals["bmi"],
            cholesterol=vitals["cholesterol"],
            hba1c=vitals["hba1c"],
            smoker_status=is_smoker,
            diabetes_status=has_diabetes,
            hypertension_status=has_hypertension,
            risk_score=risk_score,
            risk_classification=risk_class
        )
        db.add(patient)

        if (i + 1) % 100 == 0:
            db.flush()
            logger.info(f"  Flushed batch — {i + 1}/{count} patients created...")

        patients_created.append(patient)

    db.commit()
    logger.info(f"✓ Committed {count} patients to database.")

    # Refresh all patients to get auto-assigned IDs
    for p in patients_created:
        db.refresh(p)

    return patients_created


def seed_consultations(db: Session, patients: list):
    """Seeds consultation records for a subset of patients."""
    subset = random.sample(patients, min(PATIENTS_WITH_CONSULTATIONS, len(patients)))
    conditions = list(CONDITION_SYMPTOMS.keys())
    total_consultations = 0

    logger.info(f"Seeding consultation history for {len(subset)} patients...")

    for patient in subset:
        num_consultations = random.randint(
            MIN_CONSULTATIONS_PER_PATIENT, MAX_CONSULTATIONS_PER_PATIENT
        )

        for _ in range(num_consultations):
            # Pick a condition weighted toward patient's actual conditions
            if patient.diabetes_status and random.random() < 0.5:
                condition_key = "type 2 diabetes"
            elif patient.hypertension_status and random.random() < 0.5:
                condition_key = "essential hypertension"
            else:
                condition_key = random.choice(conditions)

            symptoms = random.choice(CONDITION_SYMPTOMS[condition_key])
            mapping = coding_service.get_mapping(condition_key) or {}

            # Spread consultation dates over the past 2 years
            days_ago = random.randint(1, 730)
            consult_date = datetime.now(timezone.utc) - timedelta(days=days_ago)

            consultation = Consultation(
                patient_id=patient.id,
                consultation_date=consult_date,
                symptoms=symptoms,
                clinical_notes=f"AI Clinical Summary: Patient presented with symptoms consistent with {mapping.get('condition', condition_key)}. Codes mapped per SNOMED/ICD-10 standards.",
                icd10_code=mapping.get("icd10_code"),
                icd10_description=mapping.get("icd10_description"),
                snomed_code=mapping.get("snomed_code"),
                snomed_description=mapping.get("snomed_description")
            )
            db.add(consultation)
            total_consultations += 1

    db.commit()
    logger.info(f"✓ Committed {total_consultations} consultation records.")
    return total_consultations


# ------------------------------------------------------------------
# ENTRY POINT
# ------------------------------------------------------------------

if __name__ == "__main__":
    # Ensure all tables exist before seeding
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        patients = seed_patients(db, TOTAL_PATIENTS)
        if patients:
            total_consults = seed_consultations(db, patients)
            logger.info("\n" + "="*50)
            logger.info("SEEDING COMPLETE")
            logger.info(f"  Patients created    : {TOTAL_PATIENTS}")
            logger.info(f"  Consultations created: {total_consults}")
            logger.info("="*50)
        else:
            logger.info("No new patients were seeded.")
    finally:
        db.close()
