from pathlib import Path
from config import DATADIR

class DataExporter:
    """데이터 출력 경로 관리 및 내보내기."""
    def __init__(self):
        self.base = DATADIR

    def get_path(self, subdir: str = None) -> Path:
        """경로 반환. subdir 없으면 base, 있으면 base/subdir."""
        if subdir:
            return self.base / subdir
        return self.base

    def ensure_dirs(self) -> None:
        """출력 디렉토리 생성."""
        self.get_path("texts").mkdir(parents=True, exist_ok=True)
        self.get_path("audio").mkdir(parents=True, exist_ok=True)
