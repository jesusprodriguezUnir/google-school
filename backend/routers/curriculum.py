from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from uuid import uuid4

router = APIRouter(
    prefix="/curriculum",
    tags=["Curriculum Standard"]
)

@router.get("/templates", response_model=List[schemas.SubjectTemplateResponse])
def get_templates(level: models.EducationLevel = None, db: Session = Depends(get_db)):
    query = db.query(models.SubjectTemplate)
    if level:
        query = query.filter(models.SubjectTemplate.education_level == level)
    return query.all()

@router.post("/templates", response_model=schemas.SubjectTemplateResponse)
def create_template(template: schemas.SubjectTemplateCreate, db: Session = Depends(get_db)):
    db_template = models.SubjectTemplate(
        id=str(uuid4()),
        name=template.name,
        default_hours=template.default_hours,
        education_level=template.education_level
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/templates/{template_id}")
def delete_template(template_id: str, db: Session = Depends(get_db)):
    db_template = db.query(models.SubjectTemplate).filter(models.SubjectTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(db_template)
    db.commit()
    return {"ok": True}
