from typing import Dict

from controller import PDFLoader, build_generate_script_response, build_speech_response, DataExporter
from utils import make_filename
from core.script import ScriptGenerator
from core.tts import TtsEngine


class PipeLogic:
    """파이프라인 로직."""
    def __init__(self):
        self.script_generator = ScriptGenerator()
        self.exporter = DataExporter()

    def generate_script_for_pdf(self, pdf_id: int, pdf_name: str) -> Dict:
        """PDF에서 발표 대본 생성."""
        self.exporter.ensure_dirs()
        pdf_path = self.exporter.get_path() / pdf_name
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF 파일을 찾을 수 없습니다: {pdf_path}")

        loader = PDFLoader.from_path(str(pdf_path))
        scripts = self.script_generator.generate_script(loader.pdf_contents)

        texts_dir = self.exporter.get_path("texts")
        if scripts:
            for idx, script in enumerate(scripts, start=1):
                (texts_dir / make_filename(pdf_id, idx, "txt")).write_text(script, encoding="utf-8")
            return build_generate_script_response(pdf_id, 1, scripts[0])
        else:
            (texts_dir / make_filename(pdf_id, 1, "txt")).write_text("", encoding="utf-8")
            return build_generate_script_response(pdf_id, 1, "")

    def synthesize_speech(self, pdf_id: int, page_num: int, script: str) -> Dict:
        """텍스트를 음성으로 변환."""
        self.exporter.ensure_dirs()
        if page_num < 1:
            raise ValueError("pageNum은 1 이상의 정수여야 합니다.")

        audio_name = make_filename(pdf_id, page_num, "wav")
        audio_path = self.exporter.get_path("audio") / audio_name

        tts = TtsEngine(engine="pyttsx", prefer_lang="ko")
        tts.synthesize(text=script, output_path=str(audio_path))
        return build_speech_response(pdf_id, page_num, audio_name)
