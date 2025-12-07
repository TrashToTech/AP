from typing import Dict

from controller import PDFLoader, build_generate_script_response, build_speech_response, DataExporter
from utils import make_filename
from core.script import ScriptGenerator, PdfValidator
from core.tts import TtsEngine


class PipeLogic:
    """파이프라인 로직."""
    def __init__(self):
        self.pdf_validator = PdfValidator()
        self.script_generator = ScriptGenerator()
        self.exporter = DataExporter()

    def generate_script_for_pdf(self, pdf_id: int, pdf_name: str) -> Dict:
        """PDF에서 발표 대본 생성."""
        self.exporter.ensure_dirs()
        pdf_path = self.exporter.get_path() / pdf_name
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF 파일을 찾을 수 없습니다: {pdf_path}")

        # PDF 로드
        loader = PDFLoader.from_path(str(pdf_path))

        # 1단계: PDF 검증
        print("\n" + "="*60)
        print("[1단계] PDF 검증")
        print("="*60)
        validation_result = self.pdf_validator.invoke(loader.pdf_contents)

        if not validation_result['is_presentation']:
            # 발표 자료가 아니면 빈 응답 반환
            print(f"\n발표 자료가 아닙니다 (유형: {validation_result['reason']})")
            print("대본 생성을 중단합니다.\n")
            texts_dir = self.exporter.get_path("texts")
            # 모든 페이지에 빈 파일 저장
            result_scripts = []
            for page_num in sorted(loader.pdf_contents.keys()):
                (texts_dir / make_filename(pdf_id, page_num, "txt")).write_text("", encoding="utf-8")
                result_scripts.append({"pageNum": page_num, "script": ""})
            return build_generate_script_response(pdf_id, result_scripts)

        # 페이지 필터링 (대본 생성이 필요한 페이지만)
        page_validations = validation_result['page_validations']
        filtered_contents = {
            page_num: content
            for page_num, content in loader.pdf_contents.items()
            if page_validations.get(page_num, False)
        }

        print(f"\n발표 자료입니다 (유형: {validation_result['reason']})")
        print(f"총 {len(loader.pdf_contents)}페이지 중 {len(filtered_contents)}페이지 대본 생성 예정\n")

        # 2단계: 이미지 분석 및 대본 생성
        print("="*60)
        print("[2단계] 이미지 분석 및 대본 생성")
        print("="*60)
        scripts = self.script_generator.generate_script(filtered_contents)

        # 3단계: 결과 저장 및 응답 생성
        print("\n" + "="*60)
        print("[3단계] 대본 저장")
        print("="*60)
        texts_dir = self.exporter.get_path("texts")

        result_scripts = []
        if scripts:
            # 스킵된 페이지를 고려하여 저장
            script_idx = 0
            for page_num in sorted(loader.pdf_contents.keys()):
                if page_validations.get(page_num, False):
                    # 대본 생성이 필요한 페이지
                    if script_idx < len(scripts):
                        script_text = scripts[script_idx]
                        (texts_dir / make_filename(pdf_id, page_num, "txt")).write_text(
                            script_text, encoding="utf-8"
                        )
                        result_scripts.append({"pageNum": page_num, "script": script_text})
                        script_idx += 1
                else:
                    # 스킵된 페이지는 빈 파일 저장
                    (texts_dir / make_filename(pdf_id, page_num, "txt")).write_text("", encoding="utf-8")
                    result_scripts.append({"pageNum": page_num, "script": ""})

            print(f"{len(scripts)}개 페이지 대본 저장 완료\n")
        else:
            # 생성된 대본이 없으면 모든 페이지 빈 파일
            for page_num in sorted(loader.pdf_contents.keys()):
                (texts_dir / make_filename(pdf_id, page_num, "txt")).write_text("", encoding="utf-8")
                result_scripts.append({"pageNum": page_num, "script": ""})
            print("생성된 대본이 없습니다.\n")

        return build_generate_script_response(pdf_id, result_scripts)

    def synthesize_speech(self, pdf_id: int, pdf_info: list) -> Dict:
        """텍스트를 음성으로 변환 (배치 처리)."""
        self.exporter.ensure_dirs()

        result_audios = []
        tts = TtsEngine(engine="pyttsx", prefer_lang="ko")

        for page_info in pdf_info:
            page_num = page_info["pageNum"]
            script = page_info["script"]

            if page_num < 1:
                raise ValueError(f"pageNum은 1 이상의 정수여야 합니다. (현재: {page_num})")

            # 빈 대본은 건너뛰기
            if not script or not script.strip():
                print(f"페이지 {page_num}: 빈 대본, TTS 건너뛰기")
                continue

            audio_name = make_filename(pdf_id, page_num, "wav")
            audio_path = self.exporter.get_path("audio") / audio_name

            try:
                print(f"페이지 {page_num}: TTS 합성 중...")
                tts.synthesize(text=script, output_path=str(audio_path))
                result_audios.append({"pageNum": page_num, "name": audio_name})
                print(f"페이지 {page_num}: TTS 완료 ({audio_name})")
            except Exception as e:
                print(f"페이지 {page_num}: TTS 실패 - {e}")
                raise

        return build_speech_response(pdf_id, result_audios)
