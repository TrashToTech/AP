from typing import Dict


def build_generate_script_response(pdf_id: int, page: int, script: str) -> Dict:
    """스크립트 생성 응답 구조."""
    return {
        "pdfId": pdf_id,
        "pdfInfo": {"pageNum": page, "script": script},
    }


def build_speech_response(pdf_id: int, page: int, name: str) -> Dict:
    """음성 합성 응답 구조."""
    return {
        "pdfId": pdf_id,
        "audio": {"pageNum": page, "name": name},
    }
