from pydantic import BaseModel
from typing import List, Optional, Union
from .models import UserRole, InvoiceStatus, InvoiceType

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

class ClassGroupResponse(ClassGroupBase):
    id: str
    teacher_id: str

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

    class Config:
        from_attributes = True

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
