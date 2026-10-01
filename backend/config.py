import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

def reload_env():
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(BASE_DIR.parent / ".env", override=True)

# Initial load
reload_env()

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/chefmate.db")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

def get_gemini_api_key() -> str:
    # Check env, and re-read .env files if unset
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key or key == "your_api_key_here":
        reload_env()
        key = os.getenv("GEMINI_API_KEY", "").strip()
    return key

def is_gemini_configured() -> bool:
    """Check if a valid Gemini API key is configured."""
    key = get_gemini_api_key()
    return bool(key and key != "your_api_key_here" and len(key) > 10)
