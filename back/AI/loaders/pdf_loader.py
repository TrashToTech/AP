import fitz


class PDFLoader:
    def __init__(self, pdf_document):
        self._document = pdf_document
        self.pdf_contents = {}
        self._populate_pdf_contents()

    def _get_text(self, page, mode="text"):
        return page.get_text(mode).strip()

    def _get_images(self, page):
        images = []
        for xref, *_ in page.get_images(full=True):
            base_image = self._document.extract_image(xref)
            image_bytes = base_image.get("image")
            if image_bytes:
                if base_image["width"] > 50 and base_image["height"] > 50:
                    images.append(image_bytes)
        return images

    def _populate_pdf_contents(self):
        for page_number, page in enumerate(self._document, start=1):
            self.pdf_contents[page_number] = {
                "text": self._get_text(page),
                "images": self._get_images(page),
            }

    @classmethod
    def from_path(cls, pdf_path):
        return cls(fitz.open(pdf_path))

    def summary(self):
        print(f"총 페이지: {len(self._document)}")
        for i, content in self.pdf_contents.items():
            print(f"[Page {i}] 텍스트 길이={len(content['text'])}, 이미지={len(content['images'])}개")
