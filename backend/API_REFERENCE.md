# MediBridge AI — Backend API Reference

**Base URL (local):** `http://localhost:8000`  
**Base URL (production):** `https://your-service.onrender.com`  
**Interactive Docs:** `{base_url}/docs`  
**OpenAPI Spec:** `{base_url}/openapi.json`

---

## Authentication

No authentication is implemented in v1.0. All endpoints are public.  
> In future: JWT Bearer tokens will be enforced per route group.

---

## 1. Health

### `GET /`
Returns server identity and documentation link.

**Response 200:**
```json
{
  "app": "MediBridge AI API Server",
  "version": "1.0.0",
  "documentation": "/docs"
}
```

---

### `GET /health`
Verifies server uptime and Neon PostgreSQL connectivity.

**Response 200 (healthy):**
```json
{
  "status": "healthy",
  "database": "Connected",
  "environment": "production"
}
```

**Response 200 (degraded):**
```json
{
  "status": "unhealthy",
  "database": "Disconnected: connection refused",
  "environment": "production"
}
```

---

## 2. Patients — `/api/patients`

### `POST /api/patients/`
Registers a new patient. Auto-generates ABHA if omitted.

**Request Body:**
```json
{
  "first_name": "Priya",
  "last_name": "Sharma",
  "date_of_birth": "1978-03-22",
  "gender": "Female",
  "phone": "+919876543210",
  "email": "priya.sharma@example.com",
  "address": "12 MG Road, Bengaluru, Karnataka",
  "blood_pressure_systolic": 145,
  "blood_pressure_diastolic": 92,
  "heart_rate": 82,
  "bmi": 28.4,
  "cholesterol": 235.0,
  "hba1c": 7.8,
  "smoker_status": false,
  "diabetes_status": true,
  "hypertension_status": true
}
```

**Response 201:**
```json
{
  "id": 1001,
  "abha_number": "91-3849-2047-5821",
  "first_name": "Priya",
  "last_name": "Sharma",
  "date_of_birth": "1978-03-22",
  "gender": "Female",
  "phone": "+919876543210",
  "email": "priya.sharma@example.com",
  "address": "12 MG Road, Bengaluru, Karnataka",
  "blood_pressure_systolic": 145,
  "blood_pressure_diastolic": 92,
  "heart_rate": 82,
  "bmi": 28.4,
  "cholesterol": 235.0,
  "hba1c": 7.8,
  "smoker_status": false,
  "diabetes_status": true,
  "hypertension_status": true,
  "risk_score": 0.0,
  "risk_classification": "Low",
  "created_at": "2026-06-11T00:35:40Z",
  "updated_at": "2026-06-11T00:35:40Z"
}
```

**Error 400:** `{ "detail": "A patient with this ABHA number already exists." }`  
**Error 400:** `{ "detail": "Invalid ABHA number format. Must match XX-XXXX-XXXX-XXXX." }`

---

### `GET /api/patients/`
Returns a paginated list of all patients.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Records to skip (offset) |
| `limit` | int | 50 | Max records to return (max 100) |

**Example:** `GET /api/patients/?skip=0&limit=10`

**Response 200:** Array of `PatientResponse` objects.

---

### `GET /api/patients/search/abha`
Finds a patient by their exact ABHA number.

**Query Parameters:**

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| `abha_number` | string | ✅ | `91-1234-5678-9012` |

**Example:** `GET /api/patients/search/abha?abha_number=91-1234-5678-9012`

**Response 200:** Single `PatientResponse` object.  
**Error 404:** `{ "detail": "Patient not found with the provided ABHA number." }`

---

### `GET /api/patients/{patient_id}`
Fetches a single patient record by database ID.

**Path Parameters:**

| Parameter | Type | Example |
|-----------|------|---------|
| `patient_id` | int | `42` |

**Response 200:** Single `PatientResponse` object.  
**Error 404:** `{ "detail": "Patient with ID 42 not found." }`

---

## 3. Clinical Operations — `/api/clinical`

### `POST /api/clinical/symptom-check`
Submits patient symptoms to Mistral AI for clinical analysis, maps ICD-10/SNOMED codes, updates risk score, persists the consultation, and writes audit logs.

**Request Body:**
```json
{
  "patient_id": 1,
  "symptoms": "Crushing chest pain radiating to the left shoulder, sweating, and shortness of breath for the last 45 minutes."
}
```

**Response 201:**
```json
{
  "consultation_id": 205,
  "primary_concern": "Acute Cardiac Chest Pain",
  "clinical_summary": "Patient presented with classic symptoms of acute myocardial ischemia — crushing chest pain with radiation to left shoulder, diaphoresis, and dyspnea. Immediate cardiology evaluation is recommended.",
  "urgency_level": "Critical",
  "icd10_code": "I20.9",
  "icd10_description": "Angina pectoris, unspecified",
  "snomed_code": "426396005",
  "snomed_description": "Cardiac chest pain (finding)",
  "updated_patient_risk_score": 78.5,
  "updated_patient_risk_classification": "High"
}
```

**Error 404:** `{ "detail": "Patient with ID 1 not found." }`

---

### `GET /api/clinical/history/{patient_id}`
Returns the chronological consultation history for a patient, newest first.

**Path Parameters:**

| Parameter | Type | Example |
|-----------|------|---------|
| `patient_id` | int | `1` |

**Response 200:**
```json
[
  {
    "id": 205,
    "patient_id": 1,
    "consultation_date": "2026-06-11T00:35:40Z",
    "symptoms": "Crushing chest pain radiating to left shoulder...",
    "clinical_notes": "Acute cardiac presentation — ischemia suspected.",
    "icd10_code": "I20.9",
    "icd10_description": "Angina pectoris, unspecified",
    "snomed_code": "426396005",
    "snomed_description": "Cardiac chest pain (finding)",
    "created_at": "2026-06-11T00:35:40Z"
  }
]
```

---

## 4. FHIR Resources — `/api/fhir`

### `GET /api/fhir/Patient/{patient_id}`
Returns a FHIR R4 `Patient` resource.

**Response 200 (FHIR Patient resource):**
```json
{
  "resourceType": "Patient",
  "id": "1",
  "active": true,
  "identifier": [{ "system": "https://ndhm.gov.in/abha", "value": "91-3849-2047-5821" }],
  "name": [{ "use": "official", "text": "Priya Sharma", "family": "Sharma", "given": ["Priya"] }],
  "gender": "female",
  "birthDate": "1978-03-22",
  "telecom": [
    { "system": "phone", "value": "+919876543210", "use": "mobile" },
    { "system": "email", "value": "priya.sharma@example.com", "use": "home" }
  ],
  "address": [{ "text": "12 MG Road, Bengaluru, Karnataka" }]
}
```

---

### `GET /api/fhir/Observation/risk-score/{patient_id}`
Returns a FHIR R4 `Observation` resource for the patient risk score.

**Response 200:**
```json
{
  "resourceType": "Observation",
  "id": "risk-score-1",
  "status": "final",
  "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "441829007", "display": "Cardiovascular disease risk assessment" }] },
  "subject": { "reference": "Patient/1" },
  "effectiveDateTime": "2026-06-11T00:35:40+00:00",
  "valueQuantity": { "value": 78.5, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%" },
  "interpretation": [{ "text": "High Risk" }]
}
```

---

### `GET /api/fhir/Encounter/{consultation_id}`
Returns a FHIR R4 `Encounter` resource for a consultation.

---

### `GET /api/fhir/Condition/{consultation_id}`
Returns a FHIR R4 `Condition` resource with ICD-10 and SNOMED-CT codings.

---

### `GET /api/fhir/Patient/{patient_id}/bundle`
Exports the complete patient medical record as a FHIR R4 Collection Bundle.

**Response 200:**
```json
{
  "resourceType": "Bundle",
  "id": "bundle-patient-1",
  "type": "collection",
  "timestamp": "2026-06-11T00:35:40+00:00",
  "entry": [
    { "fullUrl": "urn:uuid:patient-1", "resource": { "resourceType": "Patient", "..." : "..." } },
    { "fullUrl": "urn:uuid:observation-risk-1", "resource": { "resourceType": "Observation", "..." : "..." } },
    { "fullUrl": "urn:uuid:encounter-205", "resource": { "resourceType": "Encounter", "..." : "..." } },
    { "fullUrl": "urn:uuid:condition-205", "resource": { "resourceType": "Condition", "..." : "..." } }
  ]
}
```

---

## 5. Audit Trails — `/api/audit`

### `GET /api/audit/`
Retrieves system audit logs with optional filters.

**Query Parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `action` | string | `EXPORT_FHIR_BUNDLE` | Filter by action code |
| `start_date` | date | `2026-06-01` | Logs from this date (inclusive) |
| `end_date` | date | `2026-06-30` | Logs until this date (inclusive) |
| `skip` | int | `0` | Pagination offset |
| `limit` | int | `100` | Max results (up to 500) |

**Known Action Codes:**

| Action Code | Triggered By |
|-------------|-------------|
| `CREATE_PATIENT` | `POST /api/patients/` |
| `VIEW_PATIENT_PROFILE` | `GET /api/patients/{id}` |
| `SEARCH_PATIENT_ABHA` | `GET /api/patients/search/abha` |
| `SYMPTOM_CHECK_START` | `POST /api/clinical/symptom-check` |
| `SYMPTOM_CHECK_COMPLETE` | `POST /api/clinical/symptom-check` |
| `VIEW_CONSULTATION_HISTORY` | `GET /api/clinical/history/{id}` |
| `EXPORT_FHIR_PATIENT` | `GET /api/fhir/Patient/{id}` |
| `EXPORT_FHIR_OBSERVATION` | `GET /api/fhir/Observation/risk-score/{id}` |
| `EXPORT_FHIR_ENCOUNTER` | `GET /api/fhir/Encounter/{id}` |
| `EXPORT_FHIR_CONDITION` | `GET /api/fhir/Condition/{id}` |
| `EXPORT_FHIR_BUNDLE` | `GET /api/fhir/Patient/{id}/bundle` |

**Response 200:**
```json
[
  {
    "id": 1,
    "timestamp": "2026-06-11T00:35:40Z",
    "action": "SYMPTOM_CHECK_COMPLETE",
    "performed_by": "Clinician User",
    "patient_id": 1,
    "details": "{\"consultation_id\": 205, \"urgency\": \"Critical\", \"risk_score\": 78.5}"
  }
]
```

---

## 6. Analytics & Dashboards — `/api/analytics`

### `GET /api/analytics/summary`
Dashboard headline statistics for KPI cards.

**Response 200:**
```json
{
  "total_patients": 1000,
  "total_consultations": 1623,
  "high_risk_count": 287,
  "high_risk_pct": 28.7,
  "avg_risk_score": 32.41,
  "diabetes_count": 138,
  "hypertension_count": 312,
  "smoker_count": 201
}
```

---

### `GET /api/analytics/risk-distribution`
Patient counts per risk tier (for pie/donut charts).

**Response 200:**
```json
{ "low": 245, "medium": 468, "high": 287, "total": 1000 }
```

---

### `GET /api/analytics/vitals-averages`
Population-wide average vitals (for gauge/stat cards).

**Response 200:**
```json
{
  "avg_systolic": 128.42,
  "avg_diastolic": 82.17,
  "avg_heart_rate": 74.35,
  "avg_bmi": 25.91,
  "avg_cholesterol": 196.83,
  "avg_hba1c": 5.94
}
```

---

### `GET /api/analytics/condition-cohorts`
Disease burden breakdown (for grouped bar charts).

**Response 200:**
```json
{
  "total_patients": 1000,
  "diabetes_count": 138,
  "hypertension_count": 312,
  "smoker_count": 201,
  "diabetes_pct": 13.8,
  "hypertension_pct": 31.2,
  "smoker_pct": 20.1
}
```

---

### `GET /api/analytics/high-risk-patients?limit=20`
Top-N high-risk patients sorted by score (for priority watchlist widget).

**Response 200:** Array of patient risk profiles.

---

### `GET /api/analytics/top-conditions?limit=10`
Most frequent ICD-10 diagnoses across consultations (for ranked bar charts).

**Response 200:**
```json
[
  { "icd10_code": "I10", "icd10_description": "Essential (primary) hypertension", "count": 248 },
  { "icd10_code": "E11.9", "icd10_description": "Type 2 diabetes mellitus without complications", "count": 187 }
]
```

---

### `GET /api/analytics/age-risk-buckets`
Average risk by age group (for grouped bar charts).

**Response 200:**
```json
[
  { "age_group": "18-34", "count": 210, "avg_risk_score": 14.3 },
  { "age_group": "35-49", "count": 320, "avg_risk_score": 28.7 },
  { "age_group": "50-64", "count": 280, "avg_risk_score": 48.2 },
  { "age_group": "65+",   "count": 190, "avg_risk_score": 67.5 }
]
```
