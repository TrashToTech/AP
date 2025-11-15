from core.script_generator.base_model import BaseLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import base64
from io import BytesIO
from PIL import Image


class ImageAnalysis(BaseModel):
    is_chart: bool = Field(description="이미지가 데이터 시각화인지 여부")
    description: str = Field(description="이미지에 대한 설명")


class ImageInspector(BaseLM):
    def __init__(self):
        super().__init__("vlm")
        self.parser = JsonOutputParser(pydantic_object=ImageAnalysis)

    def _bytes_to_base64(self, image_bytes):
        return base64.b64encode(image_bytes).decode("utf-8")

    def _prepare_image(self, image_bytes):
        try:
            img = Image.open(BytesIO(image_bytes))

            if img.mode == "RGBA":
                img = img.convert("RGB")
            elif img.mode == "P":
                img = img.convert("RGB")

            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            return self._bytes_to_base64(buffered.getvalue())
        except Exception as e:
            print(f"이미지 처리 오류: {e}")
            return None

    def _make_chain(self, text, image_base64):
        template = self._get_template("image_inspect")

        prompt = ChatPromptTemplate.from_messages([
            ("system", template),
            ("user", [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ])
        ])

        chain = prompt | self.model | self.parser
        return chain

    def invoke(self, text, image_bytes):
        image_base64 = self._prepare_image(image_bytes)
        if not image_base64:
            return {
                "is_chart": False,
                "description": "이미지 처리 실패"
            }

        chain = self._make_chain(text, image_base64)
        try:
            result = chain.invoke({
                "text": text,
                "format_instructions": self.parser.get_format_instructions()
            })
            return result
        except Exception as e:
            print(f"이미지 분석 실패: {e}")
            return {
                "is_chart": False,
                "description": f"분석 오류: {str(e)}"
            }

    def inspect_images(self, page_content):
        results = []
        text = page_content.get("text", "")
        images = page_content.get("images", [])

        if not images:
            return results

        print(f"  - {len(images)}개 이미지 분석 중...")

        for idx, img_bytes in enumerate(images, 1):
            try:
                print(f"    이미지 {idx}/{len(images)} 분석 중...", end=" ")
                analysis = self.invoke(text, img_bytes)
                results.append(analysis)
                print("완료")
            except Exception as e:
                print(f"실패: {e}")
                results.append({
                    "is_chart": False,
                    "description": "분석 실패"
                })

        return results
