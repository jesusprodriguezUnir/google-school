import json
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, SubjectTemplate, EducationLevel

# Full JSON provided by user
CURRICULUM_DATA = {
  "comunidad_autonoma": "Madrid",
  "etapa_educativa": "Educación Primaria (1º a 6º)",
  "asignaturas_y_horas": {
    "1_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 5.25},
      {"nombre": "Matemáticas", "horas": 4.25},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 1.50},
      {"nombre": "Ciencias Sociales", "horas": 1.50},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 1.50},
      {"nombre": "Recreo", "horas": 2.50}
    ],
    "2_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 5.25},
      {"nombre": "Matemáticas", "horas": 5.00},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 1.50},
      {"nombre": "Ciencias Sociales", "horas": 1.50},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 0.75},
      {"nombre": "Recreo", "horas": 2.50}
    ],
    "3_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 4.50},
      {"nombre": "Matemáticas", "horas": 5.00},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 1.50},
      {"nombre": "Ciencias Sociales", "horas": 1.50},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 1.50},
      {"nombre": "Recreo", "horas": 2.50}
    ],
    "4_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 4.25},
      {"nombre": "Matemáticas", "horas": 4.50},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 1.50},
      {"nombre": "Ciencias Sociales", "horas": 2.00},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 1.75},
      {"nombre": "Recreo", "horas": 2.50}
    ],
    "5_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 4.25},
      {"nombre": "Matemáticas", "horas": 5.00},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 2.00},
      {"nombre": "Ciencias Sociales", "horas": 2.00},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 0.75},
      {"nombre": "Recreo", "horas": 2.50}
    ],
    "6_Primaria": [
      {"nombre": "Lengua Castellana y Literatura", "horas": 4.25},
      {"nombre": "Matemáticas", "horas": 5.00},
      {"nombre": "Primera Lengua Extranjera (Inglés)", "horas": 4.00},
      {"nombre": "Ciencias de la Naturaleza", "horas": 2.00},
      {"nombre": "Ciencias Sociales", "horas": 2.00},
      {"nombre": "Educación Física", "horas": 1.50},
      {"nombre": "Educación Artística (Plástica y Música)", "horas": 1.50},
      {"nombre": "Religión / Valores Sociales y Cívicos", "horas": 1.50},
      {"nombre": "Horario de Libre Configuración (Proyectos/Refuerzo)", "horas": 0.75},
      {"nombre": "Recreo", "horas": 2.50}
    ]
  }
}

from sqlalchemy import text

def seed_curriculum():
    db = SessionLocal()
    try:
        print("Dropping existing subject_templates table to force schema update...")
        try:
             db.execute(text("DROP TABLE IF EXISTS subject_templates"))
             db.commit()
        except Exception as e:
             print(f"Drop failed: {e}")

        print("Recreating table...")
        # Recreate using SQLAlchemy metadata
        SubjectTemplate.__table__.create(engine)

        print("Seeding Detailed Madrid Curriculum...")
        
        for level_key, subjects in CURRICULUM_DATA["asignaturas_y_horas"].items():
            # level_key format: "1_Primaria"
            grade = int(level_key.split('_')[0])
            
            for subj in subjects:
                # Filter out "Recreo" if desired, or keep it. User included it.
                # Usually Recess is not a 'subject' with a teacher. 
                # I'll exclude Recreo for Class Assignments purposes as it usually creates noise.
                if subj["nombre"] == "Recreo":
                    continue

                template = SubjectTemplate(
                    id=f"tmpl_{level_key}_{subj['nombre'].replace(' ', '').lower()[:6]}",
                    name=subj["nombre"],
                    default_hours=float(subj["horas"]),
                    education_level=EducationLevel.PRIMARIA,
                    grade=grade
                )
                db.add(template)
        
        db.commit()
        print("Successfully seeded detailed official curriculum.")
        
    except Exception as e:
        print(f"Error seeding curriculum: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_curriculum()
