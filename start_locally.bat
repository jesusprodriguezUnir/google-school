@echo off
echo ==========================================
echo   Iniciando Escuela Google (Modo Local) 
echo ==========================================

REM Comprobar dependencias Backend
if not exist "backend\venv" (
    echo [INFO] Creando entorno virtual de Python...
    python -m venv backend\venv
    call backend\venv\Scripts\activate
    echo [INFO] Instalando dependencias Backend...
    pip install -r backend\requirements.txt
) else (
    call backend\venv\Scripts\activate
)

REM Iniciar Backend en una nueva ventana
echo [INFO] Lanzando Servidor Backend (Puerto 8000)...
start "Google School Backend" cmd /k "call backend\venv\Scripts\activate & uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Comprobar dependencias Frontend
if not exist "node_modules" (
    echo [INFO] Instalando dependencias Frontend...
    call npm install
)

REM Iniciar Frontend
echo [INFO] Lanzando Frontend (Vite)...
echo [INFO] La aplicacion se abrira en tu navegador en breve...
start http://localhost:3000
cmd /k "npm run dev"
