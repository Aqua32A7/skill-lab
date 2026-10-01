import sys
from pathlib import Path

# Ensure the backend directory is in the Python module search path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Expose app for Uvicorn
from backend.main import app
