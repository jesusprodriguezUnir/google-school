from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth_utils
from .auth import get_current_user

router = APIRouter(tags=["Users"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: str,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update any user (Teacher, Student, Principal).
    Ideally restricted to Principal or the user themselves.
    """
    # 1. Fetch User
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Authorization Check (Simple: Only Principal can edit others, or user edits self)
    # For this app, Principal is superadmin.
    if current_user.role != models.UserRole.PRINCIPAL and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this user")

    # 3. Update Fields
    if user_update.name is not None:
        db_user.name = user_update.name
    
    if user_update.email is not None and user_update.email != db_user.email:
        # Check uniqueness
        existing = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        db_user.email = user_update.email

    if user_update.specialization is not None:
        db_user.specialization = user_update.specialization
    
    if user_update.max_weekly_hours is not None:
        db_user.max_weekly_hours = user_update.max_weekly_hours
    
    if user_update.avatar is not None:
        db_user.avatar = user_update.avatar

    db.commit()
    db.refresh(db_user)
    return db_user
