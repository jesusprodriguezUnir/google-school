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
    classes = db.query(models.ClassGroup).offset(skip).limit(limit).all()
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
