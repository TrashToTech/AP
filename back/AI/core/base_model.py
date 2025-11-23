import json
from langchain_google_genai import ChatGoogleGenerativeAI
from config import PARAM_PATH, PROMPTS_PATH


class BaseLM:
    """LLM/VLM 모델 초기화 및 템플릿 관리."""
    def __init__(self, param_name: str):
        with open(PARAM_PATH / f"{param_name}.json", "r", encoding="utf-8") as f:
            self.model_param = json.load(f)
        self.model = ChatGoogleGenerativeAI(**self.model_param)

    def _get_template(self, name: str) -> str:
        """프롬프트 템플릿 로드."""
        return (PROMPTS_PATH / f"{name}.prompts").read_text(encoding="utf-8")

    def _make_chain(self, *args, **kwargs):
        raise NotImplementedError

    def invoke(self, *args, **kwargs):
        raise NotImplementedError
