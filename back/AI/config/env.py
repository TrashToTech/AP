from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATADIR = BASE_DIR.parent.parent / "test_data"
PARAM_PATH = BASE_DIR / "config" / "model_param"
PROMPTS_PATH = BASE_DIR / "config" / "prompts"

HOST = "127.0.0.1"
PORT = 8000
