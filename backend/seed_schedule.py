from .database import SessionLocal, engine, Base
from . import models
from .models import User, UserRole, ClassGroup, EducationLevel, ClassSubject, ScheduleSlot
import uuid
import random

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_data():
    db = SessionLocal()
    
    # Ensure tables exist (especially new columns)
    # In a real prod env we would use Alembic, but for this dev setup we might need to 
    # force create if they don't exist, or assumption is they are created by main.py startup.
    # However, since we added columns, existing SQLite might complain if we don't migrate.
    # For this safe local setup, we'll try to just run it and see.
    # If it fails due to missing column, we might need to recreate the DB or manually alter.
    # Given the context, I'll proceed assuming the user might reset DB or I handles it.
    Base.metadata.create_all(bind=engine)

    print("--- Starting Schedule & Teacher Seeding ---")

    # 1. Create Classes (12 Classes: 1st to 6th, A and B)
    classes = []
    levels = ["1st", "2nd", "3rd", "4th", "5th", "6th"]
    groups = ["A", "B"]
    
    print("Creating 12 Classes...")
    for level in levels:
        for group in groups:
            class_name = f"{level} Grade {group}"
            # Check if exists
            existing = db.query(ClassGroup).filter(ClassGroup.name == class_name).first()
            if not existing:
                new_class = ClassGroup(
                    id=f"cls_{level}{group}_{uuid.uuid4().hex[:4]}",
                    name=class_name,
                    level=EducationLevel.PRIMARIA
                )
                db.add(new_class)
                classes.append(new_class)
            else:
                classes.append(existing)
    
    db.commit()

    # 2. Create 15 Teachers
    # Strategy: 12 Tutors (one for each class, teach main subjects) + 3 Specialists (PE, Music, Religion)
    
    print("Creating/Updating 15 Teachers...")
    
    specialists_def = [
        {"name": "Coach Steve", "spec": "PE", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Steve"},
        {"name": "Ms. Melody", "spec": "MUSIC", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Melody"},
        {"name": "Father John", "spec": "RELIGION", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"}
    ]
    
    tutors_def = [
        {"name": "Teacher Alice (1A)", "spec": "GENERAL"},
        {"name": "Teacher Bob (1B)", "spec": "GENERAL"},
        {"name": "Teacher Charlie (2A)", "spec": "GENERAL"},
        {"name": "Teacher Diana (2B)", "spec": "GENERAL"},
        {"name": "Teacher Evan (3A)", "spec": "GENERAL"},
        {"name": "Teacher Fiona (3B)", "spec": "GENERAL"},
        {"name": "Teacher George (4A)", "spec": "GENERAL"},
        {"name": "Teacher Hannah (4B)", "spec": "GENERAL"},
        {"name": "Teacher Ian (5A)", "spec": "GENERAL"},
        {"name": "Teacher Julia (5B)", "spec": "GENERAL"},
        {"name": "Teacher Kevin (6A)", "spec": "GENERAL"},
        {"name": "Teacher Laura (6B)", "spec": "GENERAL"},
    ]

    all_teachers = []

    # Create Specialists
    for sp in specialists_def:
        existing = db.query(User).filter(User.email == f"{sp['name'].replace(' ','.').lower()}@school.com").first()
        if not existing:
            t = User(
                id=f"u_{uuid.uuid4().hex[:8]}",
                name=sp['name'],
                email=f"{sp['name'].replace(' ','.').lower()}@school.com",
                hashed_password="hashed_placeholder", # In real app use hash function
                role=UserRole.TEACHER,
                avatar=sp.get('avatar'),
                max_weekly_hours=25,
                specialization=sp['spec']
            )
            db.add(t)
            all_teachers.append(t)
        else:
            all_teachers.append(existing)

    # Create Tutors
    for i, tu in enumerate(tutors_def):
        existing = db.query(User).filter(User.email == f"{tu['name'].split(' ')[1].lower()}@school.com").first()
        if not existing:
            t = User(
                id=f"u_{uuid.uuid4().hex[:8]}",
                name=tu['name'],
                email=f"{tu['name'].split(' ')[1].lower()}@school.com",
                hashed_password="hashed_placeholder",
                role=UserRole.TEACHER,
                avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={tu['name']}",
                max_weekly_hours=30,
                specialization=tu['spec']
            )
            db.add(t)
            all_teachers.append(t)
        else:
            all_teachers.append(existing)

    db.commit()

    # 3. Create Subjects & Assign Teachers
    # Subjects: Math, Language, Science, English, Art (Tutor); PE, Music, Religion (Specialist)
    
    subjects_config = [
        {"name": "Mathematics", "type": "GENERAL", "hours": 5},
        {"name": "Spanish Language", "type": "GENERAL", "hours": 5},
        {"name": "Natural Science", "type": "GENERAL", "hours": 3},
        {"name": "Social Science", "type": "GENERAL", "hours": 2},
        {"name": "English", "type": "GENERAL", "hours": 4}, # Let's assume tutors know English for now or add English specialist
        {"name": "Art", "type": "GENERAL", "hours": 1},
        {"name": "Physical Education", "type": "PE", "hours": 3},
        {"name": "Music", "type": "MUSIC", "hours": 2},
        {"name": "Religion/Values", "type": "RELIGION", "hours": 2},
        {"name": "Tutorial", "type": "GENERAL", "hours": 1},
    ]

    print("Setting up Subjects and Schedule...")
    
    # Map specialists for easy access
    pe_teacher = next(t for t in all_teachers if t.specialization == "PE")
    music_teacher = next(t for t in all_teachers if t.specialization == "MUSIC")
    religion_teacher = next(t for t in all_teachers if t.specialization == "RELIGION")

    days = ["MON", "TUE", "WED", "THU", "FRI"]
    # Slots: 1=09:00, 2=10:00, 3=11:00, 4=12:00, 5=15:00, 6=16:00
    daily_slots = 6 

    for idx, cls in enumerate(classes):
        # Identify the tutor for this class (mapped by index 0-11)
        tutor = all_teachers[3 + idx] # Skip first 3 specialists
        
        # Ensure Tutors are assigned to their class in DB
        cls.teacher_id = tutor.id

        created_subjects = []
        
        # Create Schedule Subjects in DB
        for subj in subjects_config:
            # Determine teacher
            assigned_teacher = tutor
            if subj["type"] == "PE": assigned_teacher = pe_teacher
            elif subj["type"] == "MUSIC": assigned_teacher = music_teacher
            elif subj["type"] == "RELIGION": assigned_teacher = religion_teacher
            
            new_subj = ClassSubject(
                id=f"subj_{cls.id[:4]}_{subj['name'][:3]}_{uuid.uuid4().hex[:4]}",
                class_id=cls.id,
                name=subj['name'],
                teacher_id=assigned_teacher.id,
                hours_weekly=subj['hours']
            )
            db.add(new_subj)
            created_subjects.append(new_subj)
        
        db.commit() # Commit subjects to get IDs

        # Generate a naive schedule
        # Warning: This naive approach might cause clashes for specialists. 
        # For a "seed" script validation, we will allow overlaps or just randomize for visual effect.
        # A real scheduler needs a constraint solver.
        
        # Flatten the list of subjects based on hours needed
        subject_pool = []
        for s in created_subjects:
            subject_pool.extend([s] * s.hours_weekly)
        
        # Verify pool size matching slots (30 vs sum of hours)
        # Sum of hours in config = 5+5+3+2+4+1+3+2+2+1 = 28. (2 slots free/study)
        
        random.shuffle(subject_pool)
        
        slot_counter = 0
        for day in days:
            for slot in range(1, daily_slots + 1):
                if slot_counter < len(subject_pool):
                    subj_to_sched = subject_pool[slot_counter]
                    
                    new_slot = ScheduleSlot(
                        id=f"slot_{cls.id[:4]}_{day}_{slot}_{uuid.uuid4().hex[:4]}",
                        class_id=cls.id,
                        subject_id=subj_to_sched.id,
                        day_of_week=day,
                        slot_index=slot
                    )
                    db.add(new_slot)
                    slot_counter += 1
                else:
                    # Free time / Library
                    pass
        
    db.commit()
    print("Seeding Complete!")
    db.close()

if __name__ == "__main__":
    seed_data()
