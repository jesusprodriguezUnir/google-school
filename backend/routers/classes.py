from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import models, schemas, database
from .auth import get_db, get_current_user

router = APIRouter(
    prefix="/classes",
    tags=["Classes"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.ClassGroupResponse])
async def read_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.ClassGroup)
    if current_user.role == models.UserRole.TEACHER:
        # Show classes where I am Tutor OR I teach a subject
        query = query.outerjoin(models.ClassSubject, models.ClassGroup.id == models.ClassSubject.class_id)\
                     .filter(
                         (models.ClassGroup.teacher_id == current_user.id) | 
                         (models.ClassSubject.teacher_id == current_user.id)
                     ).distinct()
    
    classes = query.offset(skip).limit(limit).all()
    return classes

@router.post("/", response_model=schemas.ClassGroupResponse)
async def create_class(class_group: schemas.ClassGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if teacher exists
    teacher = db.query(models.User).filter(models.User.id == class_group.teacher_id, models.User.role == models.UserRole.TEACHER).first()
    if not teacher:
        raise HTTPException(status_code=400, detail="Teacher not found")

    new_id = f"class_{uuid.uuid4().hex[:8]}"
    db_class = models.ClassGroup(
        id=new_id,
        name=class_group.name,
        level=class_group.level,
        teacher_id=class_group.teacher_id
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@router.put("/{class_id}", response_model=schemas.ClassGroupResponse)
async def update_class(class_id: str, class_update: schemas.ClassGroupUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_class = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if class_update.name is not None:
        db_class.name = class_update.name
    if class_update.level is not None:
        db_class.level = class_update.level
    if class_update.teacher_id is not None:
        # Verify teacher
        teacher = db.query(models.User).filter(models.User.id == class_update.teacher_id, models.User.role == models.UserRole.TEACHER).first()
        if not teacher:
            raise HTTPException(status_code=400, detail="Teacher not found")
        db_class.teacher_id = class_update.teacher_id
        
    db.commit()
    db.refresh(db_class)
    return db_class

@router.delete("/{class_id}")
async def delete_class(class_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_class = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Optional: Check for dependency (students assigned to this class)
    # For now, we allow deletion, but in production we might want to block or cascade.
    # students = db.query(models.User).filter(models.User.class_id == class_id).all()
    # if students:
    #     raise HTTPException(status_code=400, detail="Cannot delete class with students assigned")
        
    db.delete(db_class)
    db.commit()
    return {"ok": True}

# --- Subjects Management ---

@router.get("/{class_id}/subjects", response_model=List[schemas.ClassSubjectResponse])
async def read_class_subjects(class_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    subjects = db.query(models.ClassSubject).filter(models.ClassSubject.class_id == class_id).all()
    return subjects

@router.post("/{class_id}/subjects", response_model=schemas.ClassSubjectResponse)
async def create_class_subject(class_id: str, subject: schemas.ClassSubjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify class exists
    db_class = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    new_id = f"subj_{uuid.uuid4().hex[:8]}"
    db_subject = models.ClassSubject(
        id=new_id,
        class_id=class_id,
        name=subject.name,
        hours_weekly=subject.hours_weekly,
        teacher_id=subject.teacher_id
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.put("/subjects/{subject_id}", response_model=schemas.ClassSubjectResponse)
async def update_class_subject(subject_id: str, subject_update: schemas.ClassSubjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_subject = db.query(models.ClassSubject).filter(models.ClassSubject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db_subject.name = subject_update.name
    db_subject.hours_weekly = subject_update.hours_weekly
    db_subject.teacher_id = subject_update.teacher_id
    
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.delete("/subjects/{subject_id}")
async def delete_class_subject(subject_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_subject = db.query(models.ClassSubject).filter(models.ClassSubject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db.delete(db_subject)
    db.commit()
    return {"ok": True}
