from typing import Dict, List

from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.base_model import BaseLM
from core.script.img_inspector import ImageInspector


class ScriptOutput(BaseModel):
    """대본 생성 출력 스키마."""
    scripts: list = Field(description="페이지별 발표 대본 리스트")

class ScriptGenerator(BaseLM):
    """PDF 내용 분석 후 페이지별 발표 대본 생성."""

    def __init__(self):
        super().__init__("script_generate")
        self.parser = JsonOutputParser(pydantic_object=ScriptOutput)
        self.image_inspector = ImageInspector()

    def _analyze_pdf_contents(self, pdf_contents: Dict[int, Dict]) -> Dict[int, Dict]:
        """PDF 페이지별 내용 분석."""
        analyzed: Dict[int, Dict] = {}
        total = len(pdf_contents)

        print(f"\n총 {total}개 페이지 분석 시작")
        for page_num, content in pdf_contents.items():
            print(f"\n[페이지 {page_num}/{total}]")
            text = content.get("text", "")
            images = content.get("images", [])

            image_analyses = self.image_inspector.inspect_images(content) if images else []
            analyzed[page_num] = {"text": text, "image_analyses": image_analyses}

        print("\n페이지 분석 완료!")
        return analyzed

    def _format_content_for_prompt(self, analyzed: Dict[int, Dict]) -> str:
        """분석 내용을 프롬프트용 문자열로 포맷."""
        formatted: List[str] = []
        for page_num, content in analyzed.items():
            page_info = f"## 페이지 {page_num}\n\n"
            if content.get("text"):
                page_info += f"### 텍스트 내용\n{content['text']}\n\n"
            if content.get("image_analyses"):
                page_info += "### 이미지 분석 결과\n"
                for idx, analysis in enumerate(content["image_analyses"], 1):
                    page_info += f"**이미지 {idx}**\n"
                    page_info += f"- 데이터 시각화: {'예' if analysis.get('is_chart') else '아니오'}\n"
                    page_info += f"- 설명: {analysis.get('description', '없음')}\n\n"
            formatted.append(page_info)
        return "\n".join(formatted)

    def _make_chain(self):
        template = self._get_template("script_generate")
        prompt = ChatPromptTemplate.from_template(template)
        return prompt | self.model | self.parser

    def invoke(self, pdf_contents: Dict[int, Dict]) -> Dict:
        """PDF 내용으로부터 대본 생성."""
        print("PDF 내용 분석 중")
        analyzed = self._analyze_pdf_contents(pdf_contents)
        
        print("발표 대본 생성 중")
        formatted = self._format_content_for_prompt(analyzed)
        chain = self._make_chain()

        try:
            result = chain.invoke({
                "content": formatted,
                "format_instructions": self.parser.get_format_instructions(),
            })
            print("\n대본 생성 완료!")
            return result
        except Exception as e:
            print(f"\n대본 생성 오류: {e}")
            return {"scripts": []}

    def generate_script(self, pdf_contents: Dict[int, Dict]) -> List[str]:
        """PDF 내용으로부터 페이지별 대본 리스트 생성."""
        try:
            result = self.invoke(pdf_contents)
            scripts = result.get("scripts", [])
            if not scripts:
                print("\n경고: 생성된 대본이 없습니다.")
                return []
            print(f"\n총 {len(scripts)}개 페이지 대본 생성됨")
            return scripts
        except Exception as e:
            print(f"\n대본 생성 실패: {e}")
            return []
