from config import CONFIG_PATH
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from loaders.ai_config_loader import AIconfig


class BaseLM:
    def __init__(self, model_name):
        self.model_param_path = os.path.join(CONFIG_PATH, f"{model_name}.json")
        self.model_param = AIconfig.load_model_param(self.model_param_path)
        self.model = ChatGoogleGenerativeAI(**self.model_param)

    def _set_prompt(self, **inputs):
        pass

    def _get_template(self, prompt):
        template = AIconfig.load_prompt(prompt)
        return template

    def _make_chain(self, *args, **kwargs):
        raise NotImplementedError("서브클래스에서 _make_chain 메서드를 구현해야 합니다.")

    def invoke(self, *args, **kwargs):
        raise NotImplementedError("서브클래스에서 invoke 메서드를 구현해야 합니다.")