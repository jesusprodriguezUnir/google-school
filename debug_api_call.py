from backend.database import SessionLocal
from backend.models import SubjectTemplate, EducationLevel
from sqlalchemy import text

db = SessionLocal()
try:
    print("Querying templates with level=Primaria...")
    # Mimic the router logic
    level = EducationLevel.PRIMARIA
    query = db.query(SubjectTemplate).filter(SubjectTemplate.education_level == level)
    results = query.all()
    print(f"Found {len(results)} results.")
    for r in results:
        print(f" - {r.name}, {r.education_level}, Grade: {getattr(r, 'grade', 'ERR')}")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
