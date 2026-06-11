# MediBridge AI — Startup Debug Guide

**Problem:** Browser shows `127.0.0.1 refused to connect`  
**Root Cause:** Server crashed before binding to port 8000

---

## Root Causes Found & Fixed

Two critical bugs were causing the server to crash at startup before uvicorn ever opened the port:

### Bug 1 — `load_dotenv()` Called Too Late (CRITICAL)
**File:** `app.py`  
**What happened:** The original code imported `database` on line 9, but only called `load_dotenv()` on line 14. Since `database.py` reads `os.getenv("DATABASE_URL")` at module import time, the `.env` file had not yet been loaded when Python evaluated that line — so `DATABASE_URL` was always `None`, triggering an immediate `ValueError` crash.  
**Fix:** Moved `load_dotenv()` to the very top of `app.py`, before any local module imports.

### Bug 2 — Invalid CORS Configuration (CRITICAL)
**File:** `app.py`  
**What happened:** `allow_credentials=True` combined with `allow_origins=["*"]` is explicitly forbidden by the CORS specification and rejected by Starlette (FastAPI's underlying web framework) with a `ValueError` at middleware registration time — before the server even starts.  
**Starlette error:** `"ValueError: Cannot use allow_credentials=True with allow_origins=['*']"`  
**Fix:** In development mode (`ENVIRONMENT=development`), use `allow_credentials=False` with wildcard. In production, use explicit origins with credentials.

---

## Step-by-Step Diagnostic Commands

Run these in order in a PowerShell window. Each step narrows the failure point.

### Phase 1: Confirm You Are in the Right Place

```powershell
cd C:\Users\VIDISHA\.gemini\antigravity\scratch\medibridge-ai\backend

# Confirm directory contents
ls
# Must see: app.py, database.py, models.py, requirements.txt, .env, seed_patients.py
```

If `.env` is NOT listed, stop here and create it:
```powershell
Copy-Item .env.example .env
notepad .env   # Fill in DATABASE_URL
```

---

### Phase 2: Confirm Virtual Environment is Active

```powershell
# Check if (venv) prefix is showing in your prompt.
# If NOT, activate it:
.\venv\Scripts\Activate.ps1

# Verify Python is from the venv, not system Python
python -c "import sys; print(sys.executable)"
# Expected: C:\Users\VIDISHA\...\backend\venv\Scripts\python.exe
# If it shows C:\Python3x\python.exe — venv is NOT active
```

---

### Phase 3: Verify .env is Loaded Correctly

```powershell
# Check if DATABASE_URL is set and readable
python -c "
from dotenv import load_dotenv
import os
load_dotenv()
url = os.getenv('DATABASE_URL', 'NOT SET')
print('DATABASE_URL:', url[:40] + '...' if len(url) > 40 else url)
print('ENVIRONMENT :', os.getenv('ENVIRONMENT', 'NOT SET'))
"
```

Expected output (if `.env` is correct):
```
DATABASE_URL: postgresql://vidisha:pass@ep-cool-...
ENVIRONMENT : development
```

If you see `DATABASE_URL: NOT SET`:
```powershell
# Verify .env file exists and has content
Get-Content .env
# You must see a line like:
# DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

---

### Phase 4: Test Each Import Individually

Run these one at a time. The one that raises an error is your failing module:

```powershell
# Test 1: Standard library and third-party packages
python -c "import fastapi, uvicorn, sqlalchemy, pydantic, dotenv, httpx; print('Core packages OK')"

# Test 2: database.py (reads DATABASE_URL — the most common failure point)
python -c "from database import engine, Base, SessionLocal; print('database.py OK')"

# Test 3: models.py
python -c "from models import Patient, Consultation, AuditLog; print('models.py OK')"

# Test 4: fhir_utils.py
python -c "import fhir_utils; print('fhir_utils.py OK')"

# Test 5: Each service
python -c "from services.abha_service import AbhaService; print('abha_service OK')"
python -c "from services.audit_service import AuditService; print('audit_service OK')"
python -c "from services.snomed_icd_service import SnomedIcdService; print('snomed_icd_service OK')"
python -c "from services.clinical_assistant import ClinicalAssistantService; print('clinical_assistant OK')"

# Test 6: Each route
python -c "from routes import patients; print('routes/patients OK')"
python -c "from routes import clinical; print('routes/clinical OK')"
python -c "from routes import fhir; print('routes/fhir OK')"
python -c "from routes import audit; print('routes/audit OK')"
python -c "from routes import analytics; print('routes/analytics OK')"

# Test 7: Full app import
python -c "import app; print('app.py import OK')"
```

All 7 tests must print `OK`. If any one fails, it will print the exact error and line number.

---

### Phase 5: Test Database Connection

```powershell
python -c "
from database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('Database connection: OK')
except Exception as e:
    print('Database connection FAILED:', e)
"
```

Common failure messages and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `could not translate host name` | Wrong Neon hostname | Re-copy URL from console.neon.tech |
| `password authentication failed` | Wrong password in URL | Re-copy URL from console.neon.tech |
| `SSL connection is required` | Missing `?sslmode=require` | Add `?sslmode=require` to end of DATABASE_URL |
| `connection refused` | Neon project is paused | Wake it at console.neon.tech → your project |

---

### Phase 6: Start Server with Full Verbose Logging

This command captures everything — startup errors will print before the process exits:

```powershell
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000 --log-level debug 2>&1 | Tee-Object -FilePath startup_log.txt
```

- `--log-level debug` — shows every import, every route registration
- `2>&1` — captures stderr (where Python tracebacks go) alongside stdout
- `Tee-Object` — writes output to both screen AND `startup_log.txt`

After running, open the log to see everything:
```powershell
Get-Content startup_log.txt
```

If the server crashes immediately (no `Uvicorn running on` line), the log will contain the Python traceback explaining exactly what failed.

---

### Phase 7: Start Server Safely with Error Capture

If the above still doesn't show enough detail, use Python directly:

```powershell
python -c "
import traceback
try:
    import app
    print('App imported successfully')
    print('Routes registered:')
    for route in app.app.routes:
        if hasattr(route, 'path'):
            print(f'  {route.path}')
except Exception as e:
    print('STARTUP FAILED:')
    traceback.print_exc()
"
```

---

## Clean Startup Sequence (After All Fixes Applied)

Once all diagnostics pass, start the server with this command:

```powershell
# Make sure venv is active and you are in the backend directory
.\venv\Scripts\Activate.ps1

# Start with debug logging
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000 --log-level info
```

**Successful startup looks exactly like this:**
```
INFO:     Will watch for changes in these directories: ['C:\\...\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using WatchFiles
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

If you see `Application startup complete.` — the server is running. Open your browser to:
```
http://127.0.0.1:8000/docs
```

---

## Complete Troubleshooting Table

| What You See in Terminal | Root Cause | Fix |
|--------------------------|-----------|-----|
| `ValueError: DATABASE_URL is not set` | `.env` file missing or `load_dotenv()` not called before import | Ensure `.env` exists with correct `DATABASE_URL`; code fix already applied |
| `ValueError: Cannot use allow_credentials=True with allow_origins=['*']` | CORS misconfiguration | Code fix already applied; ensure `ENVIRONMENT=development` in `.env` |
| `NameError: name 'Defined' is not defined` | Old `snomed_icd_service.py` with stray text | Code fix already applied |
| `ImportError: email-validator not installed` | Missing package | `pip install email-validator` |
| `ModuleNotFoundError: No module named 'fastapi'` | venv not active | `.\venv\Scripts\Activate.ps1` |
| `ERROR: [Errno 10048] address already in use` | Port 8000 is taken | `python -m uvicorn app:app --port 8001` |
| Server starts but browser still refuses | Wrong port or URL | Use exactly `http://127.0.0.1:8000` not `localhost:8000` |
| `WinError 5 Access is denied` | PowerShell execution policy | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## Verify Server Is Running (New PowerShell Tab)

After the server is up, open a **second PowerShell window** and run:

```powershell
.\venv\Scripts\Activate.ps1

# Quick connectivity test
Invoke-RestMethod -Uri "http://127.0.0.1:8000/" | ConvertTo-Json
# Expected: { "app": "MediBridge AI API Server", "version": "1.0.0", ... }

# Database connectivity test
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" | ConvertTo-Json
# Expected: { "status": "healthy", "database": "Connected", "environment": "development" }
```

Both must return JSON — if they do, the server is fully operational.
