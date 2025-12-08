import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import User, UserRole, ClassGroup, Grade, Invoice, InvoiceStatus, InvoiceType, Announcement, parent_student_association, EducationLevel
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

    print("Creating Specific Demo Users...")
    teachers = []
    # 1. Demo Teacher matching Login.tsx
    demo_teacher = User(
        id='u_teacher_demo',
        name='Prof. Santiago García García',
        email='prof.santiago.garcia.garcia.prof@googleschool.demo',
        hashed_password=get_password_hash('password'),
        role=UserRole.TEACHER,
        avatar='https://picsum.photos/200/200?random=99'
    )
    db.add(demo_teacher)
    teachers.append(demo_teacher)
    
    # 2. Demo Parent & Student matching Login.tsx
    demo_p_id = 'u_parent_demo'
    demo_s_id = 'u_student_demo'
    
    demo_parent = User(
        id=demo_p_id, name='María Torres', email='maria.torres.parent@googleschool.demo',
        hashed_password=get_password_hash('password'), role=UserRole.PARENT,
        avatar='https://picsum.photos/200/200?random=98'
    )
    demo_student = User(
        id=demo_s_id, name='Victoria Torres', email='victoria.torres.student@googleschool.demo',
        hashed_password=get_password_hash('password'), role=UserRole.STUDENT,
        class_id='class_0', # Assign to first class
        avatar='https://picsum.photos/200/200?random=97'
    )
    
    db.add(demo_parent)
    db.add(demo_student)
    demo_student.parents.append(demo_parent)
    
    # Add some demo grades/invoices for them
    db.commit()

    print("Creating Random Teachers...")
    # Create 30 teachers to ensure coverage
    for i in range(30):
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
    classes = []
    
    # Full School Structure
    # Infantil: 3, 4, 5 years
    # Primaria: 1st to 6th
    # Secundaria: 1st to 4th
    
    structure = [
        ("Infantil 3 años", EducationLevel.INFANTIL),
        ("Infantil 4 años", EducationLevel.INFANTIL),
        ("Infantil 5 años", EducationLevel.INFANTIL),
        ("1º Primaria", EducationLevel.PRIMARIA),
        ("2º Primaria", EducationLevel.PRIMARIA),
        ("3º Primaria", EducationLevel.PRIMARIA),
        ("4º Primaria", EducationLevel.PRIMARIA),
        ("5º Primaria", EducationLevel.PRIMARIA),
        ("6º Primaria", EducationLevel.PRIMARIA),
        ("1º ESO", EducationLevel.SECUNDARIA),
        ("2º ESO", EducationLevel.SECUNDARIA),
        ("3º ESO", EducationLevel.SECUNDARIA),
        ("4º ESO", EducationLevel.SECUNDARIA),
    ]

    class_cnt = 0
    for grade_name, level in structure:
        # Create Group A and Group B for each grade
        for group in ["A", "B"]:
            class_name = f"{grade_name} {group}"
            
            # Assign a teacher (cycle through them)
            teacher = teachers[class_cnt % len(teachers)]
            
            class_group = ClassGroup(
                id=f'class_{class_cnt}',
                name=class_name,
                level=level,
                teacher_id=teacher.id
            )
            db.add(class_group)
            classes.append(class_group)
            class_cnt += 1
    
    db.commit()

    print("Creating Students & Parents...")
    student_count = 0
    for cls in classes:
        # Create 10 students per class (Requested by user)
        for i in range(10):
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
            subjects = ["Matemáticas", "Lengua", "Historia", "Ciencias", "Inglés"]
            
            for sub_idx, sub in enumerate(subjects):
                # Randomize scores a bit
                base_score = random.randint(4, 10) 
                
                grade = Grade(
                    id=f'grade_{s_id}_{sub_idx}',
                    student_id=s_id,
                    subject=sub,
                    score=float(min(10, max(1, base_score))),
                    feedback=get_random_element(["Buen trabajo", "Puede mejorar", "Excelente", "Necesita repasar", "Progresa adecuadamente"]),
                    date=datetime.now().date().isoformat()
                )
                db.add(grade)
            
            # Invoices
            inv_types = [InvoiceType.DINING, InvoiceType.TRANSPORT, InvoiceType.EXTRA]
            for inv_idx, type in enumerate(inv_types):
                # Only some students have these services
                if random.random() > 0.6: 
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
        # Create announcements for some classes
        if random.random() > 0.5:
            ann = Announcement(
                id=f'ann_{cls.id}', author_id=cls.teacher_id, title=f'Excursión de {cls.name}',
                content='Traer autorización firmada y ropa cómoda.', date='2025-10-15', target_class_id=cls.id
            )
            db.add(ann)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
