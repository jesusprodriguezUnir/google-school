from backend.database import SessionLocal
from backend.models import User

def list_users():
    db = SessionLocal()
    try:
        print("\n=== CREDENTIALS DUMP ===")
        print("PRINCIPALS:")
        for u in db.query(User).filter(User.role == 'PRINCIPAL').all():
            print(f"  User: {u.email} / Pass: password ({u.name})")
            
        print("\nTEACHERS (Sample):")
        for u in db.query(User).filter(User.role == 'TEACHER').limit(5).all():
             print(f"  User: {u.email} / Pass: password ({u.name})")
            
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
