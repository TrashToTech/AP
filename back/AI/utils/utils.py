import json


def read_json(path) -> dict:
    """JSON 파일 로드."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def make_filename(pdf_id: int, page: int, ext: str) -> str:
    """파일명 생성."""
    return f"{pdf_id}_p{page}.{ext}"
