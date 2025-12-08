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
}

export interface Student extends User {
  role: UserRole.STUDENT;
  classId: string;
  parentIds: string[];
}

export interface Teacher extends User {
  role: UserRole.TEACHER;
  assignedClassIds: string[];
}

export interface Parent extends User {
  role: UserRole.PARENT;
  childrenIds: string[];
}

export interface ClassGroup {
  id: string;
  name: string; // e.g., "1A", "2B"
  teacherId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number; // 0-10
  feedback: string;
  date: string;
}

export interface Invoice {
  id: string;
  parentId: string;
  studentId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  type: InvoiceType;
  dueDate: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  date: string;
  targetClassId?: string; // If null, global
}

// Full State for the Mock DB
export interface SchoolData {
  users: User[];
  classes: ClassGroup[];
  grades: Grade[];
  invoices: Invoice[];
  announcements: Announcement[];
}