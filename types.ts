export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum InvoiceType {
  TUITION = 'Tuition',
  DINING = 'Dining Hall',
  TRANSPORT = 'School Bus',
  EXTRA = 'Extracurricular',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  class_id?: string; // Added optional class_id for Student
}

export interface Student extends User {
  role: UserRole.STUDENT;
  class_id: string;
  parent_ids: string[];
}

export interface Teacher extends User {
  role: UserRole.TEACHER;
  assigned_class_ids: string[];
}

export interface Parent extends User {
  role: UserRole.PARENT;
  children_ids: string[];
}

export enum EducationLevel {
  INFANTIL = 'Infantil',
  PRIMARIA = 'Primaria',
  SECUNDARIA = 'Secundaria',
}

export interface ClassGroup {
  id: string;
  name: string;
  level: EducationLevel;
  teacher_id: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  feedback: string;
  date: string;
}

export interface Invoice {
  id: string;
  parent_id: string;
  student_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  type: InvoiceType;
  due_date: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  date: string;
  target_class_id?: string;
}

// Full State for the Mock DB
export interface SchoolData {
  users: User[];
  classes: ClassGroup[];
  grades: Grade[];
  invoices: Invoice[];
  announcements: Announcement[];
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: string; // MON, TUE ...
  slot_index: number;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  name: string;
  teacher_id?: string;
  hours_weekly: number;
}

export interface ScheduleSlot {
  id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  slot_index: number;
  subject_name?: string;
  teacher_name?: string;
}