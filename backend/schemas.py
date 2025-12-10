from pydantic import BaseModel
from typing import List, Optional, Union
from .models import UserRole, InvoiceStatus, InvoiceType, EducationLevel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Base Schemas
class GradeBase(BaseModel):
    subject: str
    score: float
    feedback: str
    date: str

class GradeResponse(GradeBase):
    id: str
    student_id: str
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    amount: float
    currency: str
    status: InvoiceStatus
    type: InvoiceType
    due_date: str

class InvoiceResponse(InvoiceBase):
    id: str
    parent_id: str
    student_id: str

    class Config:
        from_attributes = True

class AnnouncementBase(BaseModel):
    title: str
    content: str
    date: str

class AnnouncementResponse(AnnouncementBase):
    id: str
    author_id: str
    target_class_id: Optional[str] = None

    class Config:
        from_attributes = True

class ClassGroupBase(BaseModel):
    name: str
    level: EducationLevel

class ClassGroupCreate(ClassGroupBase):
    teacher_id: str

class ClassGroupUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[EducationLevel] = None
    teacher_id: Optional[str] = None

class ClassSubjectCreate(BaseModel):
    name: str
    teacher_id: Optional[str] = None
    hours_weekly: int

class ClassSubjectResponse(ClassSubjectCreate):
    id: str
    class_id: str
    class Config:
        from_attributes = True

class ClassGroupResponse(ClassGroupBase):
    id: str
    teacher_id: Optional[str] = None
    subjects: List[ClassSubjectResponse] = []

    class Config:
        from_attributes = True

class UserCommon(BaseModel):
    name: str
    email: str
    role: UserRole
    avatar: Optional[str] = 'https://picsum.photos/200'

class UserBase(UserCommon):
    id: str

class UserCreate(UserCommon):
    password: str

class UserResponse(UserBase):
    # Depending on role, additional fields might be populated or null
    class_id: Optional[str] = None # For Students
    max_weekly_hours: Optional[int] = None # For Teachers
    specialization: Optional[str] = None # For Teachers
    children: List['UserResponse'] = [] # For Parents

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    class_id: Optional[str] = None
    avatar: Optional[str] = None

    avatar: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    avatar: Optional[str] = None
    specialization: Optional[str] = None
    max_weekly_hours: Optional[int] = None

class BootstrapData(BaseModel):
    users: List[UserResponse]
    classes: List[ClassGroupResponse]
    grades: List[GradeResponse]
    invoices: List[InvoiceResponse]
    announcements: List[AnnouncementResponse]

class DashboardSummary(BaseModel):
    total_students: int
    total_teachers: int
    total_revenue_pending: float
    total_revenue_collected: float

class ChartDataPoint(BaseModel):
    name: str
    value: float

class DashboardCharts(BaseModel):
    revenue_by_month: List[ChartDataPoint]
    student_performance: List[ChartDataPoint]

# --- Scheduling Schemas ---

class AvailabilityCreate(BaseModel):
    teacher_id: str
    day_of_week: str
    slot_index: int

class AvailabilityResponse(AvailabilityCreate):
    id: str
    class Config:
        from_attributes = True



class ScheduleSlotCreate(BaseModel):
    class_id: str
    subject_id: str
    day_of_week: str
    slot_index: int

class ScheduleSlotResponse(ScheduleSlotCreate):
    id: str
    
    # Optional nested data for UI ease
    subject_name: Optional[str] = None 
    teacher_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class SubjectTemplateBase(BaseModel):
    name: str
    default_hours: int
    education_level: EducationLevel

class SubjectTemplateCreate(SubjectTemplateBase):
    pass

class SubjectTemplateResponse(SubjectTemplateBase):
    id: str
    class Config:
        from_attributes = True

UserResponse.update_forward_refs()
