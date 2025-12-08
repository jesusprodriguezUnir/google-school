import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import User, UserRole, ClassGroup, Grade, Invoice, InvoiceStatus, InvoiceType, Announcement, parent_student_association
from .auth_utils import get_password_hash

# --- Data Arrays from dataGenerator.ts ---
firstNamesMale = ["Santiago", "Mateo", "Sebastián", "Leonardo", "Matías", "Diego", "Alejandro", "Daniel", "Lucas", "Tomás", "Gabriel", "Martín", "Nicolás", "Samuel", "David", "Juan", "Pedro", "Pablo", "Hugo", "Álvaro", "Adrián", "Enzo", "Leo", "Mario", "Manuel"]
firstNamesFemale = ["Sofía", "Valentina", "Isabella", "Camila", "Mariana", "Lucía", "Victoria", "Daniela", "Martina", "Elena", "Sara", "Carla", "Claudia", "Ana", "Carmen", "Paula", "Julia", "Alba", "Emma", "Lola", "Candela", "Vega", "Noa", "Olivia", "Abril"]
lastNames = ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Ortiz", "Castillo", "Moreno", "Jiménez", "Ruiz", "Muñoz", "Alvarez", "Romero", "Navarro"]

def get_random_element(arr):
    return arr[random.randint(0, len(arr) - 1)]

def generate_name():
    is_female = random.random() > 0.5
    first = get_random_element(firstNamesFemale) if is_female else get_random_element(firstNamesMale)
    last1 = get_random_element(lastNames)
    last2 = get_random_element(lastNames)
    return f"{first} {last1} {last2}"

def generate_email(name: str, role: str):
    clean_name = name.lower().replace(" ", ".").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    return f"{clean_name}.{role}@googleschool.demo"

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Creating Principal...")
    principal = User(
        id='u_principal_01',
        name='Director Roberto Gómez',
        email='director@googleschool.demo',
        hashed_password=get_password_hash('password'),
        role=UserRole.PRINCIPAL,
        avatar='https://picsum.photos/200/200?random=1'
    )
    db.add(principal)
    db.commit()

    print("Creating Teachers...")
    teachers = []
    for i in range(6):
        name = generate_name()
        teacher = User(
            id=f'u_teacher_{i}',
            name=f'Prof. {name}',
            email=generate_email(name, 'prof'),
            hashed_password=get_password_hash('password'),
            role=UserRole.TEACHER,
            avatar=f'https://picsum.photos/200/200?random={i+10}'
        )
        teachers.append(teacher)
        db.add(teacher)
    db.commit()

    print("Creating Classes...")
    class_names = ["1º ESO A", "1º ESO B", "2º ESO A"]
    classes = []
    for idx, name in enumerate(class_names):
        teacher_idx = 0 if idx == 1 else idx # Logic from TS: Class 0->T0, Class 1->T0, Class 2->T1
        
        cls = ClassGroup(
            id=f'class_{idx}',
            name=name,
            teacher_id=teachers[teacher_idx].id
        )
        classes.append(cls)
        db.add(cls)
    db.commit()

    print("Creating Students & Parents...")
    student_count = 0
    for cls in classes:
        # Create 20 students per class
        for i in range(20):
            student_count += 1
            s_name = generate_name()
            s_id = f'u_student_{student_count}'
            
            # Parents
            p1_name = generate_name()
            p2_name = generate_name()
            p1_id = f'u_parent_{student_count}_a'
            p2_id = f'u_parent_{student_count}_b'
            
            p1 = User(
                id=p1_id, name=p1_name, email=generate_email(p1_name, 'parent'),
                hashed_password=get_password_hash('password'), role=UserRole.PARENT,
                avatar=f'https://picsum.photos/200/200?random={student_count+500}'
            )
            p2 = User(
                id=p2_id, name=p2_name, email=generate_email(p2_name, 'parent'),
                hashed_password=get_password_hash('password'), role=UserRole.PARENT,
                avatar=f'https://picsum.photos/200/200?random={student_count+600}'
            )
            db.add(p1)
            db.add(p2)
            
            student = User(
                id=s_id, name=s_name, email=generate_email(s_name, 'student'),
                hashed_password=get_password_hash('password'), role=UserRole.STUDENT,
                class_id=cls.id,
                avatar=f'https://picsum.photos/200/200?random={student_count+100}'
            )
            # Add parents
            student.parents.append(p1)
            student.parents.append(p2)
            db.add(student)
            
            # Grades
            subjects = ["Matemáticas", "Lengua", "Historia"]
            class_idx = int(cls.id.split('_')[1])
            
            for sub_idx, sub in enumerate(subjects):
                base_score = random.randint(5, 10)
                if class_idx == 1: base_score = min(10, base_score + 1)
                if class_idx == 2: base_score = max(1, base_score - 2)
                
                grade = Grade(
                    id=f'grade_{s_id}_{sub_idx}',
                    student_id=s_id,
                    subject=sub,
                    score=float(min(10, max(1, base_score))),
                    feedback=get_random_element(["Buen trabajo", "Puede mejorar", "Excelente", "Necesita repasar"]),
                    date=datetime.now().date().isoformat()
                )
                db.add(grade)
            
            # Invoices
            inv_types = [InvoiceType.DINING, InvoiceType.TRANSPORT, InvoiceType.EXTRA]
            for inv_idx, type in enumerate(inv_types):
                amount = 120 if type == InvoiceType.DINING else 85 if type == InvoiceType.TRANSPORT else 45
                invoice = Invoice(
                    id=f'inv_{s_id}_{inv_idx}',
                    parent_id=p1_id,
                    student_id=s_id,
                    amount=amount,
                    currency='EUR',
                    status=InvoiceStatus.PENDING if random.random() > 0.7 else InvoiceStatus.PAID,
                    type=type,
                    due_date='2025-12-01'
                )
                db.add(invoice)

    # Announcements
    ann1 = Announcement(
        id='ann_1', author_id=principal.id, title='Bienvenida al Curso 2024-2025',
        content='Esperamos que este nuevo año escolar esté lleno de aprendizaje.',
        date='2025-09-01'
    )
    db.add(ann1)

    for cls in classes:
        ann = Announcement(
            id=f'ann_{cls.id}', author_id=cls.teacher_id, title=f'Excursión de {cls.name}',
            content='Traer autorización.', date='2025-10-15', target_class_id=cls.id
        )
        db.add(ann)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
