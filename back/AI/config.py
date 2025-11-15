import os
import json
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config")
PROMPTS_PATH = os.path.join(BASE_DIR, "prompts")


class Config:
    @staticmethod
    def read_json(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def get_config_path(config_name):
        return os.path.join(CONFIG_PATH, f"{config_name}.json")

    @staticmethod
    def get_prompt_path(prompt_name):
        return os.path.join(PROMPTS_PATH, f"{prompt_name}.prompts")
