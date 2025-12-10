import sqlite3

def migrate():
    conn = sqlite3.connect('school_app.db')
    cursor = conn.cursor()
    
    try:
        print("Migrating 'users' table...")
        # Add max_weekly_hours
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN max_weekly_hours INTEGER DEFAULT 20")
            print("- Added column 'max_weekly_hours'")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("- Column 'max_weekly_hours' already exists")
            else:
                print(f"- Error adding 'max_weekly_hours': {e}")

        # Add specialization
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN specialization TEXT")
            print("- Added column 'specialization'")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("- Column 'specialization' already exists")
            else:
                print(f"- Error adding 'specialization': {e}")
        
        conn.commit()
        print("Migration complete.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
