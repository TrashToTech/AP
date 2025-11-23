from typing import Dict, List
import fitz

class PDFLoader:
    """PDF에서 페이지별 텍스트와 이미지를 추출."""
    def __init__(self, pdf_document):
        self._document = pdf_document
        self.pdf_contents: Dict[int, Dict[str, object]] = {}
        self._populate_pdf_contents()

    def _get_text(self, page, mode: str = "text") -> str:
        return page.get_text(mode).strip()

    def _get_images(self, page) -> List[bytes]:
        images: List[bytes] = []
        for xref, *_ in page.get_images(full=True):
            base_image = self._document.extract_image(xref)
            image_bytes = base_image.get("image")
            if image_bytes:
                if base_image.get("width", 0) > 50 and base_image.get("height", 0) > 50:
                    images.append(image_bytes)
        return images

    def _populate_pdf_contents(self) -> None:
        for page_number, page in enumerate(self._document, start=1):
            self.pdf_contents[page_number] = {
                "text": self._get_text(page),
                "images": self._get_images(page),
            }

    @classmethod
    def from_path(cls, pdf_path: str) -> "PDFLoader":
        return cls(fitz.open(pdf_path))
