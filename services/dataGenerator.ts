import {
  UserRole,
  User,
  Student,
  Teacher,
  Parent,
  ClassGroup,
  Grade,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Announcement,
  SchoolData
} from '../types';

// Helpers for Spanish Names
const firstNamesMale = ["Santiago", "Mateo", "Sebastián", "Leonardo", "Matías", "Diego", "Alejandro", "Daniel", "Lucas", "Tomás", "Gabriel", "Martín", "Nicolás", "Samuel", "David", "Juan", "Pedro", "Pablo", "Hugo", "Álvaro", "Adrián", "Enzo", "Leo", "Mario", "Manuel"];
const firstNamesFemale = ["Sofía", "Valentina", "Isabella", "Camila", "Mariana", "Lucía", "Victoria", "Daniela", "Martina", "Elena", "Sara", "Carla", "Claudia", "Ana", "Carmen", "Paula", "Julia", "Alba", "Emma", "Lola", "Candela", "Vega", "Noa", "Olivia", "Abril"];
const lastNames = ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Ortiz", "Castillo", "Moreno", "Jiménez", "Ruiz", "Muñoz", "Alvarez", "Romero", "Navarro"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateName = (): string => {
  const isFemale = Math.random() > 0.5;
  const first = isFemale ? getRandomElement(firstNamesFemale) : getRandomElement(firstNamesMale);
  const last1 = getRandomElement(lastNames);
  const last2 = getRandomElement(lastNames);
  return `${first} ${last1} ${last2}`;
};

const generateEmail = (name: string, role: string): string => {
  const cleanName = name.toLowerCase().replace(/ /g, '.').replace(/[áéíóúñ]/g, (c) => c === 'ñ' ? 'n' : 'aeiou'["áéíóú".indexOf(c)]);
  return `${cleanName}.${role}@googleschool.demo`;
};

// Main Generator
export const generateSchoolData = (): SchoolData => {
  const users: User[] = [];
  const classes: ClassGroup[] = [];
  const grades: Grade[] = [];
  const invoices: Invoice[] = [];
  const announcements: Announcement[] = [];

  // 1. Create Principal
  const principal: User = {
    id: 'u_principal_01',
    name: 'Director Roberto Gómez',
    email: 'director@googleschool.demo',
    role: UserRole.PRINCIPAL,
    avatar: 'https://picsum.photos/200/200?random=1'
  };
  users.push(principal);

  // 2. Create 6 Teachers
  const teachers: Teacher[] = [];
  for (let i = 0; i < 6; i++) {
    const name = generateName();
    const teacher: Teacher = {
      id: `u_teacher_${i}`,
      name: `Prof. ${name}`,
      email: generateEmail(name, 'prof'),
      role: UserRole.TEACHER,
      assignedClassIds: [], // Assigned later
      avatar: `https://picsum.photos/200/200?random=${i + 10}`
    };
    teachers.push(teacher);
    users.push(teacher);
  }

  // 3. Create 3 Classes
  // We want the first teacher (Demo Teacher) to have 2 classes to properly test the "Multi-Class" selector.
  const classNames = ["1º ESO A", "1º ESO B", "2º ESO A"];

  classNames.forEach((name, idx) => {
    // Logic: 
    // Class 0 ("1º ESO A") -> Teacher 0
    // Class 1 ("1º ESO B") -> Teacher 0 (Multi-class!)
    // Class 2 ("2º ESO A") -> Teacher 1
    const teacherIndex = idx === 1 ? 0 : idx;

    const classGroup: ClassGroup = {
      id: `class_${idx}`,
      name: name,
      teacherId: teachers[teacherIndex].id
    };
    teachers[teacherIndex].assignedClassIds.push(classGroup.id);
    classes.push(classGroup);
  });

  // 4. Create Students (60 total, 20 per class) & Parents
  let studentCount = 0;
  classes.forEach((cls) => {
    for (let i = 0; i < 20; i++) {
      studentCount++;
      const studentName = generateName();
      const studentId = `u_student_${studentCount}`;

      // Create 2 Parents for this student
      const parent1Name = generateName();
      const parent2Name = generateName();
      const parent1Id = `u_parent_${studentCount}_a`;
      const parent2Id = `u_parent_${studentCount}_b`;

      const parent1: Parent = {
        id: parent1Id,
        name: parent1Name,
        email: generateEmail(parent1Name, 'parent'),
        role: UserRole.PARENT,
        childrenIds: [studentId],
        avatar: `https://picsum.photos/200/200?random=${studentCount + 500}`
      };

      const parent2: Parent = {
        id: parent2Id,
        name: parent2Name,
        email: generateEmail(parent2Name, 'parent'),
        role: UserRole.PARENT,
        childrenIds: [studentId],
        avatar: `https://picsum.photos/200/200?random=${studentCount + 600}`
      };

      users.push(parent1, parent2);

      const student: Student = {
        id: studentId,
        name: studentName,
        email: generateEmail(studentName, 'student'),
        role: UserRole.STUDENT,
        classId: cls.id,
        parentIds: [parent1Id, parent2Id],
        avatar: `https://picsum.photos/200/200?random=${studentCount + 100}`
      };
      users.push(student);

      // 5. Generate Grades (3 Subjects)
      const subjects = ["Matemáticas", "Lengua", "Historia"];
      const classIdx = classes.findIndex(c => c.id === cls.id);

      subjects.forEach((sub, subIdx) => {
        let baseScore = Math.floor(Math.random() * 6) + 5; // Default 5-10
        if (classIdx === 1) baseScore = Math.min(10, baseScore + 1); // High performing ("1º ESO B")
        if (classIdx === 2) baseScore = Math.max(1, baseScore - 2); // Struggling ("2º ESO A")

        grades.push({
          id: `grade_${studentId}_${subIdx}`,
          studentId: studentId,
          subject: sub,
          score: Math.min(10, Math.max(1, baseScore)),
          feedback: getRandomElement(["Buen trabajo", "Puede mejorar", "Excelente", "Necesita repasar"]),
          date: new Date().toISOString().split('T')[0]
        });
      });

      // 6. Generate Invoices
      const invTypes = [InvoiceType.DINING, InvoiceType.TRANSPORT, InvoiceType.EXTRA];
      invTypes.forEach((type, invIdx) => {
        invoices.push({
          id: `inv_${studentId}_${invIdx}`,
          parentId: parent1Id,
          studentId: studentId,
          amount: type === InvoiceType.DINING ? 120 : type === InvoiceType.TRANSPORT ? 85 : 45,
          currency: 'EUR',
          status: Math.random() > 0.7 ? InvoiceStatus.PENDING : InvoiceStatus.PAID,
          type: type,
          dueDate: '2025-12-01'
        });
      });
    }
  });

  // 7. Announcements
  announcements.push({
    id: 'ann_1',
    authorId: principal.id,
    title: 'Bienvenida al Curso 2024-2025',
    content: 'Esperamos que este nuevo año escolar esté lleno de aprendizaje y crecimiento para todos.',
    date: '2025-09-01'
  });

  classes.forEach(cls => {
    announcements.push({
      id: `ann_${cls.id}`,
      authorId: cls.teacherId,
      title: `Excursión de ${cls.name}`,
      content: 'Recordad traer la autorización firmada para la visita al museo.',
      date: '2025-10-15',
      targetClassId: cls.id
    });
  });

  // 8. Custom Demo Family (Multi-Child Parent)
  const demoStudent1: Student = {
    id: 'student_demo_1',
    name: 'Victoria Torres',
    email: 'victoria.student@googleschool.demo',
    role: UserRole.STUDENT,
    classId: classes[0].id,
    parentIds: ['parent_demo_1'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria'
  };

  const demoStudent2: Student = {
    id: 'student_demo_2',
    name: 'Lucas Torres',
    email: 'lucas.student@googleschool.demo',
    role: UserRole.STUDENT,
    classId: classes[1].id,
    parentIds: ['parent_demo_1'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas'
  };

  const demoParent: Parent = {
    id: 'parent_demo_1',
    name: 'María Torres',
    email: 'maria.parent@googleschool.demo',
    role: UserRole.PARENT,
    childrenIds: [demoStudent1.id, demoStudent2.id],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
  };

  // Add Demo Grades for both
  const demoGrades = [
    { id: 'g_d1_1', studentId: demoStudent1.id, subject: 'Matemáticas', score: 9, feedback: 'Excelente trabajo', date: '2025-11-01' },
    { id: 'g_d1_2', studentId: demoStudent1.id, subject: 'Historia', score: 7, feedback: 'Buen progreso', date: '2025-11-02' },
    { id: 'g_d2_1', studentId: demoStudent2.id, subject: 'Ciencias', score: 6, feedback: 'Necesita mejorar en lab', date: '2025-11-01' },
    { id: 'g_d2_2', studentId: demoStudent2.id, subject: 'Inglés', score: 8, feedback: 'Very good!', date: '2025-11-03' },
  ];
  grades.push(...demoGrades);

  // Add Demo Invoices
  invoices.push({
    id: 'inv_demo_1', parentId: demoParent.id, studentId: demoStudent1.id, amount: 120, currency: 'EUR', status: InvoiceStatus.PENDING, type: InvoiceType.DINING, dueDate: '2025-12-05'
  });
  invoices.push({
    id: 'inv_demo_2', parentId: demoParent.id, studentId: demoStudent2.id, amount: 85, currency: 'EUR', status: InvoiceStatus.PENDING, type: InvoiceType.TRANSPORT, dueDate: '2025-12-10'
  });

  // Prepend to users so they are picked up by the Login Demo buttons
  users.unshift(demoParent, demoStudent1, demoStudent2);

  return { users, classes, grades, invoices, announcements };
};