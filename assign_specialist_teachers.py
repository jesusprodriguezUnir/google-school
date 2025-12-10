
import urllib.request
import json
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=json_data, method=method)
        req.add_header('Content-Type', 'application/json')
    else:
        req = urllib.request.Request(url, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def create_or_get_teacher(name, email, subject, hours=25):
    print(f"Checking teacher: {name}...")
    # 1. Fetch all users to find if exists (inefficient but simple for script)
    users = make_request('GET', '/api/bootstrap') # using bootstrap to get all users or login properly. 
    # Actually /api/bootstrap requires auth.
    # Let's use the public endpoint if exists? 
    # The routers/users.py is protected.
    # But wait, I can seed directly via database if I import models? No, app is running.
    # I should use the auth token or just bypass if I wrote a backdoor.
    
    # Alternative: Use "Login" to get token.
    login_data = {"username": "director@googleschool.demo", "password": "password"}
    # Note: Backend expects form-data for login usually, let's check auth router.
    # Actually, let's look at `seed_templates.py`. It didn't use auth.
    # `curriculum.router` endpoints were open? Yes.
    # But `users.router` put is protected.
    
    # Since I am running this locally and I have access to the code, I can write a script
    # that uses the `database` module directly to avoid Auth checks, same as `seed_schedule.py`.
    # It allows direct DB manipulation.
    return None

# Direct DB Main
from backend import models, database
import uuid

def assign_specialists():
    db = database.SessionLocal()
    print("Database connected.")

    teachers_to_create = [
        {"name": "Mozart Music", "email": "mozart@school.demo", "subject": "Música", "hours": 25},
        {"name": "Usain Bolt", "email": "bolt@school.demo", "subject": "Educación Física", "hours": 25}
    ]

    specialists = {}

    try:
        # 1. Ensure Teachers Exist
        for t_data in teachers_to_create:
            user = db.query(models.User).filter(models.User.email == t_data["email"]).first()
            if not user:
                print(f"Creating teacher {t_data['name']}...")
                user = models.User(
                    id=f"u_{uuid.uuid4().hex[:8]}",
                    name=t_data["name"],
                    email=t_data["email"],
                    hashed_password=auth_utils.get_password_hash("password"),
                    role=models.UserRole.TEACHER,
                    avatar=f"https://ui-avatars.com/api/?name={t_data['name']}",
                    max_weekly_hours=t_data["hours"],
                    specialization=t_data["subject"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                print(f"Teacher {t_data['name']} exists. Updating hours.")
                user.max_weekly_hours = t_data["hours"]
                user.specialization = t_data["subject"]
                db.commit()
            
            specialists[t_data["subject"]] = user

        # 2. Assign to Primary Classes
        primary_classes = db.query(models.ClassGroup).filter(models.ClassGroup.level == models.EducationLevel.PRIMARIA).all()
        print(f"Found {len(primary_classes)} Primary classes.")

        for cls in primary_classes:
            for specialty, teacher in specialists.items():
                print(f"  Assigning {specialty} to class {cls.name}...")
                
                # Check if subject exists
                subject = db.query(models.ClassSubject).filter(
                    models.ClassSubject.class_id == cls.id,
                    models.ClassSubject.name.ilike(f"%{specialty}%")
                ).first()

                if subject:
                    # Update existing
                    subject.teacher_id = teacher.id
                    print(f"    Updated existing subject to teacher {teacher.name}")
                else:
                    # Create new
                    new_subject = models.ClassSubject(
                        id=f"sub_{uuid.uuid4().hex[:8]}",
                        class_id=cls.id,
                        name=specialty,
                        teacher_id=teacher.id,
                        hours_weekly=2 if specialty == "Educación Física" else 1
                    )
                    db.add(new_subject)
                    print(f"    Created new subject for {teacher.name}")
        
        db.commit()
        print("Assignments completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    assign_specialists()
