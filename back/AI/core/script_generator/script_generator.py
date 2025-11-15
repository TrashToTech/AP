from core.script_generator.base_model import BaseLM
from core.script_generator.img_inspector import ImageInspector
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field


class ScriptOutput(BaseModel):
    scripts: list = Field(description="페이지별 발표 대본 리스트")


class ScriptGenerator(BaseLM):
    def __init__(self):
        super().__init__("llm")
        self.parser = JsonOutputParser(pydantic_object=ScriptOutput)
        self.image_inspector = ImageInspector()

    def _analyze_pdf_contents(self, pdf_contents):
        analyzed_contents = {}
        total_pages = len(pdf_contents)

        print(f"\n총 {total_pages}개 페이지 분석 시작...")

        for page_num, content in pdf_contents.items():
            print(f"\n[페이지 {page_num}/{total_pages}]")
            text = content.get("text", "")
            images = content.get("images", [])

            print(f"  - 텍스트 길이: {len(text)} 문자")

            image_analyses = []
            if images:
                image_analyses = self.image_inspector.inspect_images(content)

            analyzed_contents[page_num] = {
                "text": text,
                "image_analyses": image_analyses
            }

        print("\n페이지 분석 완료!")
        return analyzed_contents

    def _format_content_for_prompt(self, analyzed_contents):
        formatted = []

        for page_num, content in analyzed_contents.items():
            page_info = f"## 페이지 {page_num}\n\n"

            if content['text']:
                page_info += f"### 텍스트 내용\n{content['text']}\n\n"

            if content['image_analyses']:
                page_info += "### 이미지 분석 결과\n"
                for idx, analysis in enumerate(content['image_analyses'], 1):
                    is_chart = analysis.get('is_chart', False)
                    description = analysis.get('description', '없음')

                    page_info += f"**이미지 {idx}**\n"
                    page_info += f"- 데이터 시각화: {'예' if is_chart else '아니오'}\n"
                    page_info += f"- 설명: {description}\n\n"

            formatted.append(page_info)

        return "\n".join(formatted)

    def _make_chain(self):
        template = self._get_template("script_generate")
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.model | self.parser
        return chain

    def invoke(self, pdf_contents):
        print("\n" + "="*60)
        print("PDF 내용 분석 중...")
        print("="*60)

        analyzed_contents = self._analyze_pdf_contents(pdf_contents)

        print("\n" + "="*60)
        print("발표 대본 생성 중...")
        print("="*60)

        formatted_content = self._format_content_for_prompt(analyzed_contents)

        chain = self._make_chain()

        try:
            result = chain.invoke({
                "content": formatted_content,
                "format_instructions": self.parser.get_format_instructions()
            })
            print("\n대본 생성 완료!")
            return result
        except Exception as e:
            print(f"\n대본 생성 오류: {e}")
            return {"scripts": []}

    def generate_script(self, pdf_contents):
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
            import traceback
            traceback.print_exc()
            return []
