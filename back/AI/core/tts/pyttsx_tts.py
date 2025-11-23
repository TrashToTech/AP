import os
from typing import Optional
import pyttsx3


class PyttsxTTS:
    """pyttsx3 엔진 래퍼, 한국어 우선 선택."""

    def __init__(
        self,
        voice: Optional[str] = None,
        rate: Optional[int] = None,
        volume: Optional[float] = None,
        prefer_lang: str = "ko",
    ):
        self._engine = pyttsx3.init()
        voices = self._engine.getProperty("voices") or []

        def _voice_matches(v) -> bool:
            try:
                lang_tokens = [
                    t.decode("utf-8", "ignore") if isinstance(t, bytes) else str(t)
                    for t in getattr(v, "languages", [])
                ]
            except Exception:
                lang_tokens = []
            name = getattr(v, "name", "") or ""
            id_ = getattr(v, "id", "") or ""
            blob = " ".join([name.lower(), id_.lower()] + [t.lower() for t in lang_tokens])
            keywords = [prefer_lang.lower(), "korean", "korea", "ko-kr", "ko_kor", "kor"]
            return any(k in blob for k in keywords)

        chosen = None
        if voice:
            for v in voices:
                if voice.lower() in (getattr(v, "id", "").lower() or getattr(v, "name", "").lower()):
                    chosen = v.id
                    break
        else:
            for v in voices:
                if _voice_matches(v):
                    chosen = v.id
                    break

        if chosen:
            self._engine.setProperty("voice", chosen)
        if rate is not None:
            self._engine.setProperty("rate", int(rate))
        if volume is not None:
            self._engine.setProperty("volume", float(volume))

    def synthesize_to_file(self, text: str, output_path: str) -> str:
        """텍스트를 음성 파일로 변환."""
        if not text or not text.strip():
            raise ValueError("text는 비어있을 수 없습니다.")

        out_dir = os.path.dirname(output_path)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)

        self._engine.save_to_file(text, output_path)
        self._engine.runAndWait()
        return output_path
