from typing import Optional
from core.tts.pyttsx_tts import PyttsxTTS


class TtsEngine:
    """TTS 백엔드를 단일 인터페이스로 제공."""

    def __init__(
        self,
        engine: str = "pyttsx",
        voice: Optional[str] = None,
        rate: Optional[int] = None,
        volume: Optional[float] = None,
        prefer_lang: str = "ko",
    ):
        name = engine.lower().strip()
        if name == "pyttsx":
            self._engine = PyttsxTTS(voice=voice, rate=rate, volume=volume, prefer_lang=prefer_lang)
        else:
            raise ValueError(f"지원하지 않는 TTS 엔진: {engine}")

    def synthesize(self, text: str, output_path: str) -> str:
        """텍스트를 음성 파일로 변환."""
        return self._engine.synthesize_to_file(text=text, output_path=output_path)
