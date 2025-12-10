from backend.database import SessionLocal
from backend.models import User
from backend.auth_utils import get_password_hash

def fix_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users. Updating passwords...")
        
        default_hash = get_password_hash("password")
        
        for user in users:
            # We blindly update all to 'password' to ensure access
            user.hashed_password = default_hash
            print(f"- Updated {user.email}")
            
        db.commit()
        print("All passwords reset to 'password'")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_passwords()
