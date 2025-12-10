import urllib.request
import json
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

templates = [
    {"name": "Matemáticas", "default_hours": 5, "education_level": "Primaria"},
    {"name": "Lengua Castellana", "default_hours": 5, "education_level": "Primaria"},
    {"name": "Ciencias de la Naturaleza", "default_hours": 4, "education_level": "Primaria"},
    {"name": "Ciencias Sociales", "default_hours": 3, "education_level": "Primaria"},
    {"name": "Inglés", "default_hours": 3, "education_level": "Primaria"},
    {"name": "Educación Física", "default_hours": 2, "education_level": "Primaria"},
    {"name": "Música", "default_hours": 1, "education_level": "Primaria"},
    
    {"name": "Matemáticas", "default_hours": 4, "education_level": "Secundaria"},
    {"name": "Lengua y Literatura", "default_hours": 4, "education_level": "Secundaria"},
    {"name": "Geografía e Historia", "default_hours": 3, "education_level": "Secundaria"},
    {"name": "Biología y Geología", "default_hours": 3, "education_level": "Secundaria"},
    {"name": "Física y Química", "default_hours": 3, "education_level": "Secundaria"},
    {"name": "Inglés", "default_hours": 4, "education_level": "Secundaria"},
    {"name": "Tecnología", "default_hours": 2, "education_level": "Secundaria"},
]

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=json_data, method=method)
        req.add_header('Content-Type', 'application/json')
    else:
        req = urllib.request.Request(url, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def seed_templates():
    print("Seeding Subject Templates via urllib...")
    
    existing = make_request('GET', '/curriculum/templates')
    existing_names = set()
    if existing:
        existing_names = {(t['name'], t['education_level']) for t in existing}

    count = 0
    for t in templates:
        if (t['name'], t['education_level']) in existing_names:
            print(f"Skipping {t['name']} ({t['education_level']}) - Already exists")
            continue
            
        res = make_request('POST', '/curriculum/templates', t)
        if res:
            print(f"Created: {t['name']} ({t['education_level']})")
            count += 1
        else:
            print(f"Failed to create {t['name']}")

    print(f"\nSeeding complete. Added {count} new templates.")

if __name__ == "__main__":
    seed_templates()
