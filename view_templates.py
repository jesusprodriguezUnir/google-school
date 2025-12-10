from backend.database import SessionLocal
from backend.models import SubjectTemplate

db = SessionLocal()
try:
    tmpls = db.query(SubjectTemplate).all()
    print(f"Found {len(tmpls)} templates.")
    for t in tmpls:
        print(f" - {t.name} ({t.education_level}) [Grade: {getattr(t, 'grade', 'N/A')}]")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
