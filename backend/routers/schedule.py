from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from typing import List
import uuid
import random

router = APIRouter(prefix="/schedule", tags=["Schedule"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Availability ---

@router.post("/availability", response_model=schemas.AvailabilityResponse)
def set_availability(availability: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    # Check if exists to avoid duplicates
    existing = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == availability.teacher_id,
        models.TeacherAvailability.day_of_week == availability.day_of_week,
        models.TeacherAvailability.slot_index == availability.slot_index
    ).first()
    
    if existing:
        return existing

    new_avail = models.TeacherAvailability(
        id=str(uuid.uuid4()),
        teacher_id=availability.teacher_id,
        day_of_week=availability.day_of_week,
        slot_index=availability.slot_index
    )
    db.add(new_avail)
    db.commit()
    db.refresh(new_avail)
    return new_avail

@router.get("/availability/{teacher_id}", response_model=List[schemas.AvailabilityResponse])
def get_availability(teacher_id: str, db: Session = Depends(get_db)):
    return db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == teacher_id
    ).all()

@router.delete("/availability/{teacher_id}/{day}/{slot}")
def remove_availability(teacher_id: str, day: str, slot: int, db: Session = Depends(get_db)):
    db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == teacher_id,
        models.TeacherAvailability.day_of_week == day,
        models.TeacherAvailability.slot_index == slot
    ).delete()
    db.commit()
    return {"message": "Availability removed"}


# --- Curriculum (Subjects) ---

@router.post("/curriculum/{class_id}", response_model=List[schemas.ClassSubjectResponse])
def set_curriculum(class_id: str, subjects: List[schemas.ClassSubjectCreate], db: Session = Depends(get_db)):
    # Clear existing subjects? Or add? For now, let's clear and replace for simplicity
    db.query(models.ClassSubject).filter(models.ClassSubject.class_id == class_id).delete()
    
    created_subjects = []
    for sub in subjects:
        new_sub = models.ClassSubject(
            id=str(uuid.uuid4()),
            class_id=class_id,
            name=sub.name,
            teacher_id=sub.teacher_id,
            hours_weekly=sub.hours_weekly
        )
        db.add(new_sub)
        created_subjects.append(new_sub)
    
    db.commit()
    return created_subjects

@router.get("/curriculum/{class_id}", response_model=List[schemas.ClassSubjectResponse])
def get_curriculum(class_id: str, db: Session = Depends(get_db)):
    return db.query(models.ClassSubject).filter(models.ClassSubject.class_id == class_id).all()


# --- Generation Algorithm ---

@router.post("/generate/{class_id}", response_model=List[schemas.ScheduleSlotResponse])
def generate_schedule(class_id: str, db: Session = Depends(get_db)):
    # 1. Clear existing schedule
    db.query(models.ScheduleSlot).filter(models.ScheduleSlot.class_id == class_id).delete()
    
    # 2. Get subjects to schedule
    subjects = db.query(models.ClassSubject).filter(models.ClassSubject.class_id == class_id).all()
    if not subjects:
        raise HTTPException(status_code=400, detail="No subjects defined for this class")

    # 3. Get all teachers involved
    teacher_ids = {s.teacher_id for s in subjects if s.teacher_id}
    
    # 4. Fetch availability constraints for these teachers
    # Map: teacher_id -> set((day, slot))
    teacher_availability = {}
    for tid in teacher_ids:
        avails = db.query(models.TeacherAvailability).filter(models.TeacherAvailability.teacher_id == tid).all()
        # If no availability record found, assume fully available? Or fully unavailable?
        # Usually easier to assume fully available unless marked otherwise. 
        # BUT the model is "TeacherAvailability", which usually lists ENABLED slots.
        # Let's assume: If records exist, ONLY those slots are valid. If NO records, fully available? 
        # Safer: explicit availability required. Only schedule in listed slots.
        valid_slots = {(a.day_of_week, a.slot_index) for a in avails}
        teacher_availability[tid] = valid_slots

    # 5. Simple Backtracking/Greedy Algorithm
    schedule = [] # List of new ScheduleSlot objects
    DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
    SLOTS = range(1, 9) # 8 slots
    
    # Expand subjects into "blocks" to place
    blocks_to_place = []
    for sub in subjects:
        for _ in range(sub.hours_weekly):
            blocks_to_place.append(sub)
            
    # Shuffle to vary results if multiple runs
    random.shuffle(blocks_to_place)

    # Track usage (Global usage check would require checking ALL classes schedules. 
    # For now, we only check this class's fresh schedule + teacher availability constraint)
    # TODO: Fetch OTHER classes schedules to avoid teacher double booking implies a global check.
    # For MVP, we assumed "Main teacher" mostly.
    # To do it right: 
    # teacher_occupied = Query(ScheduleSlot).filter(teacher_id in [teachers]).all()
    
    # Map: (teacher_id, day, slot) -> Busy
    teacher_busy = set()
    global_schedules = db.query(models.ScheduleSlot).join(models.ClassSubject).filter(
        models.ClassSubject.teacher_id.in_(teacher_ids)
    ).all()
    
    for slot in global_schedules:
        # slot.subject.teacher_id is busy at slot.day, slot.slot
        t_id = slot.subject.teacher_id
        teacher_busy.add((t_id, slot.day_of_week, slot.slot_index))

    # Grid for this class: (day, slot) -> Filled
    class_grid_filled = set()

    could_not_schedule = []

    for block in blocks_to_place:
        placed = False
        # Try to find a slot
        # Heuristic: Try to spread subjects? For now just find first empty.
        for day in DAYS:
            if placed: break
            for slot_idx in SLOTS:
                if (day, slot_idx) in class_grid_filled:
                    continue # Slot taken in this class
                
                # Check teacher availability
                tid = block.teacher_id
                if tid:
                    # Constraint 1: Is teacher explicitly available?
                    # If we follow "Must have availability record", check it.
                    # If we assume "Available unless busy", skip.
                    # Let's use the explicit map if it has entries.
                    if tid in teacher_availability and teacher_availability[tid]:
                         if (day, slot_idx) not in teacher_availability[tid]:
                             continue # Teacher not available (e.g. not their working hours)

                    # Constraint 2: Is teacher busy in another class?
                    if (tid, day, slot_idx) in teacher_busy:
                        continue
                
                # Place it
                new_slot = models.ScheduleSlot(
                    id=str(uuid.uuid4()),
                    class_id=class_id,
                    subject_id=block.id,
                    day_of_week=day,
                    slot_index=slot_idx
                )
                schedule.append(new_slot)
                class_grid_filled.add((day, slot_idx))
                if tid:
                    teacher_busy.add((tid, day, slot_idx))
                placed = True
                break
        
        if not placed:
            could_not_schedule.append(block.name)

    # Save
    if schedule:
        db.add_all(schedule)
        db.commit()

    if could_not_schedule:
        # Partial success? Or Error?
        # Let's return success but maybe user sees gaps.
        print(f"Warning: Could not schedule {could_not_schedule}")
    
    # Return result
    return db.query(models.ScheduleSlot).filter(models.ScheduleSlot.class_id == class_id).all()

@router.get("/view/{class_id}", response_model=List[schemas.ScheduleSlotResponse])
def get_schedule(class_id: str, db: Session = Depends(get_db)):
    slots = db.query(models.ScheduleSlot).filter(models.ScheduleSlot.class_id == class_id).all()
    # Populate extra fields
    res = []
    for s in slots:
        # SQLAlchemy models might not auto-populate pydantic extra fields unless we map them.
        # But `from_attributes=True` handles ORM, but we need to ensure relations are loaded.
        # s.subject is loaded.
        
        # Manually constructing response to ensure safe serialization
        item = schemas.ScheduleSlotResponse(
            id=s.id,
            class_id=s.class_id,
            subject_id=s.subject_id,
            day_of_week=s.day_of_week,
            slot_index=s.slot_index,
            subject_name=s.subject.name if s.subject else "Unknown",
            teacher_name=s.subject.assigned_teacher.name if s.subject and s.subject.assigned_teacher else None
        )
        res.append(item)
    return res
