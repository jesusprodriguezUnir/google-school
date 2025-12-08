from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("Attempting to hash 'password'...")
    h = pwd_context.hash("password")
    print(f"Success: {h}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
