import base64
from io import BytesIO
from typing import Dict, List, Optional

from PIL import Image
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.base_model import BaseLM


class ImageAnalysis(BaseModel):
    """이미지 분석 결과 스키마."""
    is_chart: bool = Field(description="데이터 시각화 여부")
    description: str = Field(description="이미지 설명")


class ImageInspector(BaseLM):
    """VLM으로 이미지가 데이터 시각화인지 판단하고 설명 생성."""
    def __init__(self):
        super().__init__("image_inspect")
        self.parser = JsonOutputParser(pydantic_object=ImageAnalysis)

    def _prepare_image(self, image_bytes: bytes) -> Optional[str]:
        """이미지를 base64 인코딩."""
        try:
            img = Image.open(BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
        except Exception as e:
            print(f"이미지 처리 오류: {e}")
            return None

    def _make_chain(self, image_base64: str):
        template = self._get_template("image_inspect")
        prompt = ChatPromptTemplate.from_messages([
            ("system", template),
            ("user", [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}]),
        ])
        return prompt | self.model | self.parser

    def invoke(self, text: str, image_bytes: bytes) -> Dict:
        """단일 이미지 분석."""
        image_base64 = self._prepare_image(image_bytes)
        if not image_base64:
            return {"is_chart": False, "description": "이미지 처리 실패"}

        chain = self._make_chain(image_base64)
        try:
            return chain.invoke({"text": text, "format_instructions": self.parser.get_format_instructions()})
        except Exception as e:
            print(f"이미지 분석 실패: {e}")
            return {"is_chart": False, "description": f"분석 오류: {e}"}

    def inspect_images(self, page_content: Dict) -> List[Dict]:
        """페이지 내 모든 이미지 분석."""
        results: List[Dict] = []
        text = page_content.get("text", "")
        images: List[bytes] = page_content.get("images", [])

        if not images:
            return results

        print(f"  - {len(images)}개 이미지 분석 중...")
        for idx, img_bytes in enumerate(images, 1):
            try:
                print(f"    이미지 {idx}/{len(images)} 분석 중...", end=" ")
                results.append(self.invoke(text, img_bytes))
                print("완료")
            except Exception as e:
                print(f"실패: {e}")
                results.append({"is_chart": False, "description": "분석 실패"})
        return results
