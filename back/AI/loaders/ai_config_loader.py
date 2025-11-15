import json
import os
from config import PROMPTS_PATH


class AIconfig:
    def __init__(self):
        pass

    @staticmethod
    def read_json(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def load_prompt(prompt_name):
        prompt_path = os.path.join(PROMPTS_PATH, f"{prompt_name}.prompts")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def load_model_param(path):
        return AIconfig.read_json(path)
