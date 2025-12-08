from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, api, classes
from .database import engine, Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NextGen School API",
    description="Backend for the NextGen School Dashboard",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(api.router, prefix="/api")
app.include_router(classes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to NextGen School API"}
