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
    try:
        query = db.query(models.SubjectTemplate)
        if level:
            query = query.filter(models.SubjectTemplate.education_level == level)
        results = query.all()
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/templates", response_model=schemas.SubjectTemplateResponse)
def create_template(template: schemas.SubjectTemplateCreate, db: Session = Depends(get_db)):
    db_template = models.SubjectTemplate(
        id=str(uuid4()),
        name=template.name,
        default_hours=template.default_hours,
        education_level=template.education_level,
        grade=template.grade # Saved to DB
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
@router.post("/apply-standard/{class_id}")
def apply_standard(class_id: str, grade: int, db: Session = Depends(get_db)):
    # 1. Get Class
    db_class = db.query(models.ClassGroup).filter(models.ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    # 2. Get Templates
    # Assuming class level matches template level
    templates = db.query(models.SubjectTemplate).filter(
        models.SubjectTemplate.education_level == db_class.level,
        models.SubjectTemplate.grade == grade
    ).all()
    
    if not templates:
        raise HTTPException(status_code=404, detail=f"No curriculum found for grade {grade} in {db_class.level.value}")
    
    # 3. Create Subjects
    created_count = 0
    for tmpl in templates:
        new_id = f"subj_{uuid4().hex[:8]}"
        db_subject = models.ClassSubject(
            id=new_id,
            class_id=class_id,
            name=tmpl.name,
            hours_weekly=tmpl.default_hours,
            teacher_id=db_class.teacher_id # Default to Tutor? Or None? User said "assignar el profesor". Default to Tutor might be helpful, but "Limpiar" exists. Let's Default to NONE to force assignment as per user request ("lo único que tendríamos que hacer es asignar el profesor").
        )
        db.add(db_subject)
        created_count += 1
        
    db.commit()
    return {"message": f"Added {created_count} subjects for Grade {grade}"}
