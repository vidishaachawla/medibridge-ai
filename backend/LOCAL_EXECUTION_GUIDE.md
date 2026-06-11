# MediBridge AI — Local Execution Guide (Windows PowerShell)

**Platform:** Windows 10 / 11  
**Shell:** PowerShell 5.1+ or PowerShell 7+  
**Project Path:** `C:\Users\VIDISHA\.gemini\antigravity\scratch\medibridge-ai\backend`

> Run every command block in order. Do not skip steps.

---

## Prerequisites Check

Before starting, verify Python and pip are installed:

```powershell
python --version
# Expected: Python 3.10.x or higher

pip --version
# Expected: pip 23.x or higher
```

> If Python is not installed, download from https://python.org/downloads and ensure
> "Add Python to PATH" is checked during installation.

---

## STEP 1 — Navigate to Backend Directory

```powershell
cd C:\Users\VIDISHA\.gemini\antigravity\scratch\medibridge-ai\backend
```

Confirm you are in the right place:

```powershell
ls
# Expected files: app.py, database.py, models.py, requirements.txt, .env.example, seed_patients.py
```

---

## STEP 2 — Create Virtual Environment

```powershell
python -m venv venv
```

Confirm it was created:

```powershell
ls venv
# Expected: Include/  Lib/  Scripts/  pyvenv.cfg
```

---

## STEP 3 — Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

Your prompt should now show `(venv)` at the start, like:
```
(venv) PS C:\Users\VIDISHA\.gemini\antigravity\scratch\medibridge-ai\backend>
```

> **If you see an execution policy error**, run this first (once per machine):
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Then re-run the Activate command.

---

## STEP 4 — Install All Requirements

```powershell
pip install -r requirements.txt
```

This installs:
- FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary
- Pydantic, pydantic[email], email-validator
- python-dotenv, httpx, mistralai
- Faker, Alembic

Wait for all packages to install. You should see `Successfully installed ...` at the end.

Verify key packages:

```powershell
pip show fastapi sqlalchemy psycopg2-binary faker
# Each should show Name, Version, Location
```

---

## STEP 5 — Create .env File from Template

```powershell
Copy-Item .env.example .env
```

Confirm the file was created:

```powershell
ls .env
# Expected: .env  (file, ~600 bytes)
```

---

## STEP 6 — Configure Neon DATABASE_URL

Open `.env` in Notepad to edit:

```powershell
notepad .env
```

In Notepad, find this line:

```
DATABASE_URL=postgresql://user:password@ep-something.us-east-1.aws.neon.tech/medibridge?sslmode=require
```

Replace it with your **actual Neon PostgreSQL connection string**.

**How to get your Neon connection string:**
1. Go to https://console.neon.tech
2. Select your project (or create a new one named `medibridge`)
3. Click **"Connection Details"**
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://vidisha:<password>@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Paste it as the value of `DATABASE_URL` in `.env`

Also optionally set your Mistral AI key if you have one:
```
MISTRAL_API_KEY=your_actual_key_here
```

> If `MISTRAL_API_KEY` is left blank, the AI will use a built-in mock fallback — the app still works fully.

Save and close Notepad (`Ctrl+S`, then close).

Verify the key variables are set:

```powershell
Get-Content .env | Select-String "DATABASE_URL","MISTRAL_API_KEY","ENVIRONMENT"
# Expected: shows your filled-in values
```

---

## STEP 7 — Initialize Database Tables

Run Python to create all tables in Neon PostgreSQL:

```powershell
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine); print('Tables created successfully.')"
```

Expected output:
```
Tables created successfully.
```

> If you see `ValueError: DATABASE_URL environment variable is not set`, your `.env` file
> is missing or the `DATABASE_URL` line is still the placeholder. Go back to Step 6.

> If you see `psycopg2.OperationalError: could not connect to server`, your Neon connection
> string is incorrect. Double-check it from the Neon console.

---

## STEP 8 — Run Seed Script (1000 Synthetic Patients)

```powershell
python seed_patients.py
```

You will see progress logs like:

```
INFO: Seeding 1000 synthetic patients...
INFO:   Flushed batch — 100/1000 patients created...
INFO:   Flushed batch — 200/1000 patients created...
...
INFO:   Flushed batch — 1000/1000 patients created...
INFO: ✓ Committed 1000 patients to database.
INFO: Seeding consultation history for 400 patients...
INFO: ✓ Committed 1623 consultation records.
INFO: ==================================================
INFO: SEEDING COMPLETE
INFO:   Patients created    : 1000
INFO:   Consultations created: 1623
INFO: ==================================================
```

> The exact consultation count will vary (~800–2000) due to random generation.

> If you run this again, it will print:
> `INFO: Database already has 1000 patients. Skipping seed.`
> That is expected — the script is idempotent.

---

## STEP 9 — Verify Patient Count in Database

```powershell
python -c "
from database import SessionLocal
from models import Patient, Consultation
db = SessionLocal()
patients = db.query(Patient).count()
consultations = db.query(Consultation).count()
print(f'Patients     : {patients}')
print(f'Consultations: {consultations}')
db.close()
"
```

Expected output:
```
Patients     : 1000
Consultations: 1623
```

Both numbers must be greater than zero before starting the server.

---

## STEP 10 — Start FastAPI Server

```powershell
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Expected startup output:

```
INFO:     Will watch for changes in these directories: [...]
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...] using WatchFiles
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

> Keep this terminal open. The server must stay running for all tests below.
> Open a **new PowerShell window** for the remaining steps.

---

## STEP 11 — Open Swagger UI

Open this URL in your browser:

```
http://127.0.0.1:8000/docs
```

You should see the **MediBridge AI Backend** Swagger UI with 6 collapsible route groups:
- 🏥 Health
- 👤 Patients
- 🩺 Clinical Operations
- 📋 FHIR Resources
- 🔍 Audit Trails
- 📊 Analytics & Dashboards

Also open the OpenAPI spec at:
```
http://127.0.0.1:8000/openapi.json
```

---

## STEP 12 — Test Health Endpoint

In a new PowerShell window (with venv still active):

```powershell
cd C:\Users\VIDISHA\.gemini\antigravity\scratch\medibridge-ai\backend
.\venv\Scripts\Activate.ps1

Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET | ConvertTo-Json
```

Expected response:
```json
{
  "status": "healthy",
  "database": "Connected",
  "environment": "development"
}
```

> If `"database": "Disconnected: ..."` appears, your Neon connection string is wrong
> or your Neon project is paused. Wake it from https://console.neon.tech.

Also test the root:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/" -Method GET | ConvertTo-Json
```

Expected:
```json
{
  "app": "MediBridge AI API Server",
  "version": "1.0.0",
  "documentation": "/docs"
}
```

---

## STEP 13 — Test Analytics Endpoints

### 13a — Dashboard Summary (KPI Cards)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/summary" -Method GET | ConvertTo-Json
```

Expected (values will vary):
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

✅ Verify: `total_patients` must equal `1000`.

---

### 13b — Risk Distribution (Pie/Donut Chart Data)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/risk-distribution" -Method GET | ConvertTo-Json
```

Expected:
```json
{
  "low": 245,
  "medium": 468,
  "high": 287,
  "total": 1000
}
```

✅ Verify: `low + medium + high` must equal `total` (1000).

---

### 13c — Vitals Averages (Population Stats)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/vitals-averages" -Method GET | ConvertTo-Json
```

Expected (clinical reference ranges):
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

✅ Verify: `avg_systolic` between 100–180, `avg_bmi` between 15–45, all values non-zero.

---

### 13d — Condition Cohorts (Disease Burden)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/condition-cohorts" -Method GET | ConvertTo-Json
```

Expected:
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

### 13e — High-Risk Patient Watchlist

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/high-risk-patients?limit=5" -Method GET | ConvertTo-Json
```

Expected: Array of 5 patients with `risk_classification: "High"`, sorted by `risk_score` descending.

---

### 13f — Top Conditions (ICD-10 Frequency)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/top-conditions?limit=5" -Method GET | ConvertTo-Json
```

Expected: Top 5 ICD-10 codes with counts. E.g.:
```json
[
  { "icd10_code": "I10",   "icd10_description": "Essential (primary) hypertension", "count": 248 },
  { "icd10_code": "E11.9", "icd10_description": "Type 2 diabetes mellitus...",       "count": 187 }
]
```

---

### 13g — Age Risk Buckets

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/age-risk-buckets" -Method GET | ConvertTo-Json
```

Expected: 4 rows. `avg_risk_score` should increase with age group:
```json
[
  { "age_group": "18-34", "count": 210, "avg_risk_score": 14.3 },
  { "age_group": "35-49", "count": 320, "avg_risk_score": 28.7 },
  { "age_group": "50-64", "count": 280, "avg_risk_score": 48.2 },
  { "age_group": "65+",   "count": 190, "avg_risk_score": 67.5 }
]
```

---

## STEP 14 — Quick Bonus Tests

### Get a single patient

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/patients/1" -Method GET | ConvertTo-Json
```

### Search by ABHA number (copy a real one from the patient above)

```powershell
$abha = "91-XXXX-XXXX-XXXX"   # Replace with an actual ABHA from Step above
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/patients/search/abha?abha_number=$abha" -Method GET | ConvertTo-Json
```

### Get consultation history for patient 1

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/clinical/history/1" -Method GET | ConvertTo-Json
```

### Get FHIR bundle for patient 1

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/fhir/Patient/1/bundle" -Method GET | ConvertTo-Json -Depth 10
```

### Submit a symptom check (POST)

```powershell
$body = @{
    patient_id = 1
    symptoms   = "Severe headache, blurred vision, and dizziness for the past 3 days."
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri         "http://127.0.0.1:8000/api/clinical/symptom-check" `
    -Method      POST `
    -Body        $body `
    -ContentType "application/json" | ConvertTo-Json
```

---

## Stopping the Server

In the terminal running uvicorn, press:
```
Ctrl + C
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Set-ExecutionPolicy` error | PowerShell blocks script activation | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `ModuleNotFoundError: No module named 'fastapi'` | venv not activated | Run `.\venv\Scripts\Activate.ps1` |
| `ValueError: DATABASE_URL not set` | `.env` missing or not filled | Complete Step 6 |
| `OperationalError: could not connect` | Wrong Neon URL or paused project | Check URL; wake project at console.neon.tech |
| `ImportError: email-validator not installed` | pip install incomplete | Run `pip install email-validator` |
| `NameError: name 'Defined' is not defined` | Old version of `snomed_icd_service.py` | Already fixed in latest code |
| `total_patients: 0` in analytics | Seed script wasn't run | Run `python seed_patients.py` |
| Port 8000 already in use | Another process on port | Use `--port 8001` and update all URLs |
