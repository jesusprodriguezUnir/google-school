from backend.database import SessionLocal
from backend.models import ClassGroup, ClassSubject

def debug_db():
    db = SessionLocal()
    try:
        classes = db.query(ClassGroup).all()
        print(f"Total Classes: {len(classes)}")
        for c in classes:
            subj_count = db.query(ClassSubject).filter(ClassSubject.class_id == c.id).count()
            print(f"- {c.name} (Subjects: {subj_count})")
            
    finally:
        db.close()

if __name__ == "__main__":
    debug_db()
