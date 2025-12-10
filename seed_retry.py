import json
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import SessionLocal
from backend.models import SubjectTemplate, EducationLevel

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

def seed():
    db = SessionLocal()
    try:
        print("Seeding...")
        for level_key, subjects in CURRICULUM_DATA["asignaturas_y_horas"].items():
            grade = int(level_key.split('_')[0])
            for subj in subjects:
                if subj["nombre"] == "Recreo": continue
                
                t = SubjectTemplate(
                    id=f"tmpl_{level_key}_{subj['nombre'].replace(' ', '').lower()[:15]}", # Increased length to avoid collision
                    name=subj["nombre"],
                    default_hours=float(subj["horas"]),
                    education_level=EducationLevel.PRIMARIA,
                    grade=grade
                )
                db.add(t)
        db.commit()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
