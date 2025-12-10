from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Table, Date
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import date

# Enums matching frontend
class UserRole(str, enum.Enum):
    PRINCIPAL = 'PRINCIPAL'
    TEACHER = 'TEACHER'
    PARENT = 'PARENT'
    STUDENT = 'STUDENT'

class InvoiceStatus(str, enum.Enum):
    PENDING = 'PENDING'
    PAID = 'PAID'
    OVERDUE = 'OVERDUE'

class InvoiceType(str, enum.Enum):
    TUITION = 'Tuition'
    DINING = 'Dining Hall'
    TRANSPORT = 'School Bus'
    EXTRA = 'Extracurricular'

class EducationLevel(str, enum.Enum):
    INFANTIL = 'Infantil'
    PRIMARIA = 'Primaria'
    SECUNDARIA = 'Secundaria'

# Association Table for Parent <-> Student (Many-to-Many)
parent_student_association = Table(
    'parent_student',
    Base.metadata,
    Column('parent_id', String, ForeignKey('users.id')),
    Column('student_id', String, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    avatar = Column(String, nullable=True)
    
    # Teacher specific
    max_weekly_hours = Column(Integer, default=20)
    specialization = Column(String, nullable=True) # Comma separated: "MATH,SCIENCE"
    
    # Student specific
    class_id = Column(String, ForeignKey("class_groups.id"), nullable=True)
    
    # Relationships
    student_class = relationship("ClassGroup", foreign_keys=[class_id], back_populates="students")
    
    # As Teacher: Classes they teach
    teaching_classes = relationship("ClassGroup", foreign_keys="ClassGroup.teacher_id", back_populates="teacher")
    
    # As Parent: Children
    children = relationship(
        "User",
        secondary=parent_student_association,
        primaryjoin=id==parent_student_association.c.parent_id,
        secondaryjoin=id==parent_student_association.c.student_id,
        backref="parents"
    )

    # As Student: Grades
    grades = relationship("Grade", back_populates="student")

    # As Parent: Invoices for them
    invoices = relationship("Invoice", foreign_keys="Invoice.parent_id", back_populates="parent")

    # As Teacher: Availability
    availability = relationship("TeacherAvailability", back_populates="teacher")

class ClassGroup(Base):
    __tablename__ = "class_groups"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    level = Column(Enum(EducationLevel), default=EducationLevel.PRIMARIA)
    teacher_id = Column(String, ForeignKey("users.id"))

    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="teaching_classes")
    students = relationship("User", foreign_keys=[User.class_id], back_populates="student_class")
    announcements = relationship("Announcement", back_populates="target_class")
    
    # Scheduling
    subjects = relationship("ClassSubject", back_populates="class_group", cascade="all, delete-orphan")
    schedule_slots = relationship("ScheduleSlot", back_populates="class_group", cascade="all, delete-orphan")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("users.id"))
    subject = Column(String)
    score = Column(Float)
    feedback = Column(String)
    date = Column(String) # Storing as ISO string to match frontend simplicity, or could use Date

    student = relationship("User", back_populates="grades")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    parent_id = Column(String, ForeignKey("users.id"))
    student_id = Column(String, ForeignKey("users.id"))
    amount = Column(Float)
    currency = Column(String, default='EUR')
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.PENDING)
    type = Column(Enum(InvoiceType))
    due_date = Column(String)

    parent = relationship("User", foreign_keys=[parent_id], back_populates="invoices")
    student = relationship("User", foreign_keys=[student_id])

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    content = Column(String)
    date = Column(String)
    target_class_id = Column(String, ForeignKey("class_groups.id"), nullable=True)

    author = relationship("User", foreign_keys=[author_id])
    target_class = relationship("ClassGroup", back_populates="announcements")


# --- Scheduling Models ---

class TeacherAvailability(Base):
    __tablename__ = "teacher_availability"

    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("users.id"))
    day_of_week = Column(String) # MON, TUE, WED, THU, FRI
    slot_index = Column(Integer) # 1-8

    teacher = relationship("User", back_populates="availability")

class ClassSubject(Base):
    __tablename__ = "class_subjects"

    id = Column(String, primary_key=True, index=True)
    class_id = Column(String, ForeignKey("class_groups.id"))
    name = Column(String) # e.g. "Math"
    teacher_id = Column(String, ForeignKey("users.id"), nullable=True) # Specific teacher for this subject
    hours_weekly = Column(Integer, default=1)
    
    class_group = relationship("ClassGroup", back_populates="subjects")
    assigned_teacher = relationship("User", foreign_keys=[teacher_id])

class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id = Column(String, primary_key=True, index=True)
    class_id = Column(String, ForeignKey("class_groups.id"))
    subject_id = Column(String, ForeignKey("class_subjects.id"))
    day_of_week = Column(String) # MON, TUE, WED, THU, FRI
    slot_index = Column(Integer) # 1-8

    class_group = relationship("ClassGroup", back_populates="schedule_slots")
    subject = relationship("ClassSubject")

class SubjectTemplate(Base):
    __tablename__ = "subject_templates"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    default_hours = Column(Integer, default=1)
    education_level = Column(Enum(EducationLevel))
