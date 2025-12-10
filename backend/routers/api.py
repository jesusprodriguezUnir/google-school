from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(tags=["Dashboard"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_students = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).count()
    total_teachers = db.query(models.User).filter(models.User.role == models.UserRole.TEACHER).count()
    
    # Calculate revenue
    revenue_pending = db.query(func.sum(models.Invoice.amount)).filter(models.Invoice.status == models.InvoiceStatus.PENDING).scalar() or 0.0
    revenue_collected = db.query(func.sum(models.Invoice.amount)).filter(models.Invoice.status == models.InvoiceStatus.PAID).scalar() or 0.0
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_revenue_pending": revenue_pending,
        "total_revenue_collected": revenue_collected
    }

@router.get("/bootstrap", response_model=schemas.BootstrapData)
def get_bootstrap_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the full initial state for the application.
    In a real large-scale app, we would fetch this granularly, 
    but for this specific dashboard architecture, we sync the state on load.
    """
    users = db.query(models.User).all()
    
    # Filter Classes for Teachers
    class_query = db.query(models.ClassGroup)
    if current_user.role == models.UserRole.TEACHER:
        class_query = class_query.outerjoin(models.ClassSubject, models.ClassGroup.id == models.ClassSubject.class_id)\
                     .filter(
                         (models.ClassGroup.teacher_id == current_user.id) | 
                         (models.ClassSubject.teacher_id == current_user.id)
                     ).distinct()
    classes = class_query.all()
    grades = db.query(models.Grade).all()
    invoices = db.query(models.Invoice).all()
    announcements = db.query(models.Announcement).all()
    
    return {
        "users": users,
        "classes": classes,
        "grades": grades,
        "invoices": invoices,
        "announcements": announcements
    }

@router.get("/dashboard/charts", response_model=schemas.DashboardCharts)
def get_dashboard_charts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mock aggregation for charts as complex SQL grouping might be overkill for this initial step
    # but we can return data based on what's in DB or static structure for now as requested "mock data logic"
    
    # Revenue by Month (Mock distribution based on invoices)
    revenue_data = [
        {"name": "Jan", "value": 4000},
        {"name": "Feb", "value": 3000},
        {"name": "Mar", "value": 2000},
        {"name": "Apr", "value": 2780},
        {"name": "May", "value": 1890},
        {"name": "Jun", "value": 2390},
        {"name": "Jul", "value": 3490},
    ] # Simplified for demo
    
    # Student Performance (Average Grades by Subject)
    # This we can actually query!
    subjects = ["Matemáticas", "Lengua", "Historia", "Ciencias", "Inglés"]
    performance_data = []
    
    for sub in subjects:
        avg = db.query(func.avg(models.Grade.score)).filter(models.Grade.subject == sub).scalar()
        if avg:
            performance_data.append({"name": sub, "value": round(avg, 1)})
        else:
            performance_data.append({"name": sub, "value": 0})
            
    return {
        "revenue_by_month": revenue_data,
        "student_performance": performance_data
    }
