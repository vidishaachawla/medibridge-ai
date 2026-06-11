# MediBridge AI — Backend Test Checklist

Use this checklist when verifying a fresh deployment or after code changes.  
Swagger UI is available at: `http://localhost:8000/docs`

---

## Setup Verification

- [ ] `pip install -r requirements.txt` completes without errors
- [ ] `.env` file exists with `DATABASE_URL` and `MISTRAL_API_KEY` set
- [ ] `python seed_patients.py` runs without errors
- [ ] Seed output shows: `Patients created: 1000` and `Consultations created: ~800–2000`
- [ ] `uvicorn app:app --reload` starts without import errors

---

## Group 1: Health

| # | Test | Method | URL | Expected |
|---|------|--------|-----|----------|
| 1.1 | Index route | `GET` | `/` | 200, `"app": "MediBridge AI API Server"` |
| 1.2 | Health check (connected) | `GET` | `/health` | 200, `"status": "healthy"`, `"database": "Connected"` |

---

## Group 2: Patients

| # | Test | Method | URL / Body | Expected |
|---|------|--------|------------|----------|
| 2.1 | Create patient (no ABHA) | `POST` | `/api/patients/` with no `abha_number` | 201, auto-generated `abha_number` in `XX-XXXX-XXXX-XXXX` format |
| 2.2 | Create patient (custom ABHA) | `POST` | `/api/patients/` with `abha_number: "91-9999-8888-7777"` | 201, ABHA stored as provided |
| 2.3 | Create duplicate ABHA | `POST` | `/api/patients/` with same ABHA twice | 400, `"A patient with this ABHA number already exists."` |
| 2.4 | Invalid ABHA format | `POST` | `/api/patients/` with `abha_number: "INVALID"` | 400, format validation error |
| 2.5 | List patients (default) | `GET` | `/api/patients/` | 200, array of up to 50 patients |
| 2.6 | List patients (paginated) | `GET` | `/api/patients/?skip=100&limit=10` | 200, 10 records |
| 2.7 | Get patient by ID | `GET` | `/api/patients/1` | 200, patient with `id: 1` |
| 2.8 | Get patient by ID (not found) | `GET` | `/api/patients/99999` | 404, `"Patient with ID 99999 not found."` |
| 2.9 | Search by ABHA | `GET` | `/api/patients/search/abha?abha_number=91-XXXX-XXXX-XXXX` | 200, matching patient |
| 2.10 | Search by ABHA (not found) | `GET` | `/api/patients/search/abha?abha_number=91-0000-0000-0000` | 404 |
| 2.11 | Vitals fields present | `GET` | `/api/patients/1` | `bmi`, `hba1c`, `risk_score`, `diabetes_status` all present in response |

---

## Group 3: Clinical Operations

| # | Test | Method | URL / Body | Expected |
|---|------|--------|------------|----------|
| 3.1 | Symptom check (valid) | `POST` | `/api/clinical/symptom-check` `{ "patient_id": 1, "symptoms": "Chest pain and shortness of breath." }` | 201, `consultation_id`, `urgency_level`, `icd10_code`, `snomed_code` all present |
| 3.2 | Symptom check (patient not found) | `POST` | Same body with `patient_id: 99999` | 404 |
| 3.3 | Symptom check (too short) | `POST` | `symptoms: "cough"` (< 10 chars) | 422 Validation Error |
| 3.4 | Risk score updated | `GET` | `/api/patients/1` after step 3.1 | `risk_score > 0` and `risk_classification` not empty |
| 3.5 | Consultation stored | `GET` | `/api/clinical/history/1` | Array with at least one record including `icd10_code` |
| 3.6 | Consultation history order | `GET` | `/api/clinical/history/1` | Records sorted newest-first by `consultation_date` |
| 3.7 | History for unknown patient | `GET` | `/api/clinical/history/99999` | 404 |

---

## Group 4: FHIR Resources

| # | Test | Method | URL | Expected |
|---|------|--------|-----|----------|
| 4.1 | FHIR Patient resource | `GET` | `/api/fhir/Patient/1` | `"resourceType": "Patient"`, ABHA in `identifier[0].value` |
| 4.2 | FHIR ABHA identifier system | `GET` | `/api/fhir/Patient/1` | `identifier[0].system == "https://ndhm.gov.in/abha"` |
| 4.3 | FHIR Observation (risk score) | `GET` | `/api/fhir/Observation/risk-score/1` | `"resourceType": "Observation"`, `valueQuantity.unit == "%"` |
| 4.4 | FHIR Encounter | `GET` | `/api/fhir/Encounter/1` | `"resourceType": "Encounter"`, `"status": "finished"` |
| 4.5 | FHIR Condition (with codes) | `GET` | `/api/fhir/Condition/1` | `"resourceType": "Condition"`, `code.coding` has ICD-10 and SNOMED entries |
| 4.6 | FHIR Bundle | `GET` | `/api/fhir/Patient/1/bundle` | `"resourceType": "Bundle"`, `"type": "collection"`, `entry` array has ≥2 items |
| 4.7 | FHIR Patient (not found) | `GET` | `/api/fhir/Patient/99999` | 404 |

---

## Group 5: Audit Trails

| # | Test | Method | URL | Expected |
|---|------|--------|-----|----------|
| 5.1 | List all audit logs | `GET` | `/api/audit/` | 200, array of audit records |
| 5.2 | Filter by action | `GET` | `/api/audit/?action=CREATE_PATIENT` | All records have `action: "CREATE_PATIENT"` |
| 5.3 | Filter by date range | `GET` | `/api/audit/?start_date=2026-06-01&end_date=2026-06-30` | Records within June 2026 only |
| 5.4 | Pagination | `GET` | `/api/audit/?skip=0&limit=5` | Exactly 5 records |
| 5.5 | Audit created after symptom check | After 3.1 | `/api/audit/?action=SYMPTOM_CHECK_COMPLETE` | Record with matching `patient_id` |

---

## Group 6: Analytics

| # | Test | Method | URL | Expected |
|---|------|--------|-----|----------|
| 6.1 | Dashboard summary | `GET` | `/api/analytics/summary` | `total_patients == 1000`, `total_consultations > 0` |
| 6.2 | Risk distribution totals | `GET` | `/api/analytics/risk-distribution` | `low + medium + high == total == 1000` |
| 6.3 | Vitals averages in range | `GET` | `/api/analytics/vitals-averages` | `avg_systolic` between 100–180, `avg_bmi` between 15–45 |
| 6.4 | Condition cohorts valid | `GET` | `/api/analytics/condition-cohorts` | Each `_pct` field between 0.0–100.0 |
| 6.5 | High-risk patients sorted | `GET` | `/api/analytics/high-risk-patients?limit=5` | 5 patients, `risk_score` descending, all `risk_classification == "High"` |
| 6.6 | Top conditions count | `GET` | `/api/analytics/top-conditions?limit=10` | Up to 10 entries with valid `icd10_code` and `count > 0` |
| 6.7 | Age-risk buckets | `GET` | `/api/analytics/age-risk-buckets` | 4 rows: `18-34`, `35-49`, `50-64`, `65+`; `avg_risk_score` increases with age |

---

## Regression Checks (After Any Code Change)

- [ ] All 5 router groups appear in Swagger UI at `/docs`
- [ ] `GET /health` returns `"database": "Connected"`
- [ ] Seeded patients have `bmi`, `hba1c`, `risk_score` populated (not `null`)
- [ ] `POST /api/clinical/symptom-check` returns both AI analysis and persisted `consultation_id`
- [ ] FHIR bundle includes at least `Patient` + `Observation` entries
- [ ] Analytics `summary.total_patients` matches `risk-distribution.total`
