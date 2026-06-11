"""
reset_db.py
-----------
One-time database reset script for MediBridge AI.

Drops ALL tables and recreates them from the current SQLAlchemy models.

Usage:
    python reset_db.py

WARNING: This permanently deletes all data in the database.
         Run seed_patients.py afterwards to repopulate.
"""

import sys
from dotenv import load_dotenv

# Load .env before any local imports (DATABASE_URL must be available)
load_dotenv()

from database import engine, Base

# Import all models so SQLAlchemy registers them against Base.metadata
# Every model class must be imported here — even if not used directly —
# otherwise drop_all / create_all will not see those tables.
from models import Patient, Consultation, AuditLog  # noqa: F401


def reset_database():
    print()
    print("=" * 55)
    print("  MediBridge AI — Database Reset")
    print("=" * 55)

    # ── Step 1: Drop all tables ────────────────────────────────
    print("\n[1/3] Dropping all existing tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("      ✓ All tables dropped successfully.")
    except Exception as e:
        print(f"      ✗ Failed to drop tables: {e}")
        sys.exit(1)

    # ── Step 2: Recreate all tables ────────────────────────────
    print("\n[2/3] Recreating tables from current models...")
    try:
        Base.metadata.create_all(bind=engine)
        print("      ✓ Tables created successfully.")
    except Exception as e:
        print(f"      ✗ Failed to create tables: {e}")
        sys.exit(1)

    # ── Step 3: Verify ─────────────────────────────────────────
    print("\n[3/3] Verifying table structure...")
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if not tables:
        print("      ✗ No tables found after creation — check your models.")
        sys.exit(1)

    for table in sorted(tables):
        columns = [col["name"] for col in inspector.get_columns(table)]
        print(f"      ✓ {table:20s} ({len(columns)} columns: {', '.join(columns[:6])}{'...' if len(columns) > 6 else ''})")

    print()
    print("=" * 55)
    print("  ✓ Database reset complete.")
    print("  Next step: python seed_patients.py")
    print("=" * 55)
    print()


if __name__ == "__main__":
    # Safety confirmation prompt
    print("\n  ⚠  WARNING: This will DELETE all data in the database.")
    answer = input("     Type YES to continue, anything else to cancel: ").strip()

    if answer != "YES":
        print("     Cancelled. No changes made.")
        sys.exit(0)

    reset_database()
