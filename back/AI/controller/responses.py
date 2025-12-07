from typing import Dict, List
from pydantic import BaseModel


# Request Models
class PageInfo(BaseModel):
    """페이지 정보."""
    pageNum: int
    script: str


class SpeechRequest(BaseModel):
    """음성 합성 요청."""
    pdfId: int
    pdfInfo: List[PageInfo]


# Response Models
class ScriptPageInfo(BaseModel):
    """대본 페이지 정보."""
    pageNum: int
    script: str


class AudioPageInfo(BaseModel):
    """오디오 페이지 정보."""
    pageNum: int
    name: str


class GenerateScriptResponse(BaseModel):
    """대본 생성 응답."""
    pdfId: int
    pdfInfo: List[ScriptPageInfo]


class SpeechResponse(BaseModel):
    """음성 합성 응답."""
    pdfId: int
    audio: List[AudioPageInfo]


# Builder Functions
def build_generate_script_response(pdf_id: int, scripts: List[Dict[str, any]]) -> Dict:
    """스크립트 생성 응답 구조.

    Args:
        pdf_id: PDF ID
        scripts: [{"pageNum": int, "script": str}, ...]
    """
    return {
        "pdfId": pdf_id,
        "pdfInfo": scripts,
    }


def build_speech_response(pdf_id: int, audios: List[Dict[str, any]]) -> Dict:
    """음성 합성 응답 구조.

    Args:
        pdf_id: PDF ID
        audios: [{"pageNum": int, "name": str}, ...]
    """
    return {
        "pdfId": pdf_id,
        "audio": audios,
    }
