from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth_utils
from .auth import get_current_user

router = APIRouter(tags=["Students"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/students", response_model=List[schemas.UserResponse])
def get_all_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """List all students"""
    return db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).all()

@router.get("/students/class/{class_id}", response_model=List[schemas.UserResponse])
def get_students_by_class(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """List students in a specific class"""
    return db.query(models.User).filter(
        models.User.role == models.UserRole.STUDENT,
        models.User.class_id == class_id
    ).all()

@router.post("/students", response_model=schemas.UserResponse)
def create_student(
    student: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new student"""
    db_user = db.query(models.User).filter(models.User.email == student.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth_utils.get_password_hash(student.password)
    # Ensure role is STUDENT
    new_student = models.User(
        id=f"u_{student.email}", # Simple ID generation strategies
        name=student.name,
        email=student.email,
        hashed_password=hashed_password,
        role=models.UserRole.STUDENT,
        avatar=student.avatar
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.put("/students/{student_id}", response_model=schemas.UserResponse)
def update_student(
    student_id: str,
    student_update: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update student details"""
    db_student = db.query(models.User).filter(models.User.id == student_id, models.User.role == models.UserRole.STUDENT).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student_update.name is not None:
        db_student.name = student_update.name
    if student_update.email is not None:
        # Check if email is taken by another user
        existing_email = db.query(models.User).filter(models.User.email == student_update.email).first()
        if existing_email and existing_email.id != student_id:
             raise HTTPException(status_code=400, detail="Email already used")
        db_student.email = student_update.email
    if student_update.class_id is not None:
        db_student.class_id = student_update.class_id
    if student_update.avatar is not None:
        db_student.avatar = student_update.avatar
        
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/students/{student_id}")
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a student"""
    db_student = db.query(models.User).filter(models.User.id == student_id, models.User.role == models.UserRole.STUDENT).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Optional: Delete related records (Grades, Invoices, Parent associations)
    # For now, let's keep it simple or assume cascade logic exists or is handled manually
    # We will manually delete grades and invoices for cleaner deletion
    db.query(models.Grade).filter(models.Grade.student_id == student_id).delete()
    db.query(models.Invoice).filter(models.Invoice.student_id == student_id).delete()
    
    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted successfully"}
