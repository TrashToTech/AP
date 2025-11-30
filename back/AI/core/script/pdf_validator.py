from typing import Dict, List

from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.base_model import BaseLM


class PresentationCheckResult(BaseModel):
    """발표 자료 판단 결과 스키마."""
    is_presentation: bool = Field(description="발표 자료 여부")
    reason: str = Field(description="pdf 종류")


class PageValidationResult(BaseModel):
    """페이지 검증 결과 스키마."""
    skip_pages: List[int] = Field(description="대본 생성이 불필요한 페이지 번호 리스트")


class PdfValidator(BaseLM):
    """PDF가 발표 자료인지 판단하고, 각 페이지별로 대본 생성 필요 여부를 판단."""

    def __init__(self):
        super().__init__("pdf_validation")
        self.presentation_parser = JsonOutputParser(pydantic_object=PresentationCheckResult)
        self.page_parser = JsonOutputParser(pydantic_object=PageValidationResult)

    def _format_sample_pages(self, pdf_contents: Dict[int, Dict], max_pages: int = 3) -> str:
        """샘플 페이지를 분석용 문자열로 포맷 (발표 자료 판단용)."""
        formatted_parts = []

        for page_num in sorted(pdf_contents.keys())[:max_pages]:
            content = pdf_contents[page_num]
            page_info = f"## 페이지 {page_num}\n\n"

            # 텍스트 내용
            text = content.get("text", "").strip()
            if text:
                page_info += f"### 텍스트\n{text[:500]}\n\n"  # 첫 500자만
            else:
                page_info += "### 텍스트\n(없음)\n\n"

            # 이미지 정보
            images = content.get("images", [])
            if images:
                page_info += f"### 이미지\n{len(images)}개\n\n"

            formatted_parts.append(page_info)

        return "\n".join(formatted_parts)

    def _format_all_pages(self, pdf_contents: Dict[int, Dict]) -> str:
        """모든 페이지를 분석용 문자열로 포맷 (페이지별 검증용)."""
        formatted_parts = []

        for page_num in sorted(pdf_contents.keys()):
            content = pdf_contents[page_num]
            page_info = f"## 페이지 {page_num}\n"

            # 텍스트 내용
            text = content.get("text", "").strip()
            if text:
                # 텍스트가 너무 길면 앞부분만
                page_info += f"텍스트: {text[:300]}\n"
            else:
                page_info += "텍스트: (없음)\n"

            # 이미지 정보
            images = content.get("images", [])
            page_info += f"이미지: {len(images)}개\n"

            formatted_parts.append(page_info)

        return "\n".join(formatted_parts)

    def _check_presentation(self, pdf_contents: Dict[int, Dict]) -> Dict:
        """1단계: PDF가 발표 자료인지 판단."""
        print("\n[1단계] 발표 자료 여부 판단 중...")

        formatted_content = self._format_sample_pages(pdf_contents, max_pages=3)
        total_pages = len(pdf_contents)

        template = self._get_template("presentation_check")
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.model | self.presentation_parser

        try:
            result = chain.invoke({
                "content": formatted_content,
                "total_pages": total_pages,
                "format_instructions": self.presentation_parser.get_format_instructions(),
            })
            is_pres = result.get("is_presentation", False)
            print(f"결과: {'발표 자료입니다' if is_pres else '발표 자료가 아닙니다'}")
            print(f"이유: {result.get('reason')}")
            return result
        except Exception as e:
            print(f"오류 발생: {e}")
            # 오류 시 발표 자료가 아닌 것으로 처리
            return {
                "is_presentation": False,
                "reason": f"판단 오류 발생: {str(e)}"
            }

    def _validate_pages(self, pdf_contents: Dict[int, Dict]) -> List[int]:
        """2단계: 대본 생성이 불필요한 페이지 찾기."""
        print("\n[2단계] 대본 생성 불필요 페이지 찾는 중...")

        formatted_content = self._format_all_pages(pdf_contents)
        total_pages = len(pdf_contents)

        template = self._get_template("page_validation")
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.model | self.page_parser

        try:
            result = chain.invoke({
                "content": formatted_content,
                "total_pages": total_pages,
                "format_instructions": self.page_parser.get_format_instructions(),
            })
            skip_pages = result.get("skip_pages", [])

            # 통계 출력
            needs_script_count = total_pages - len(skip_pages)
            print(f"결과: 총 {total_pages}페이지 중 {needs_script_count}페이지 대본 생성 필요 (스킵: {len(skip_pages)}페이지)")

            return skip_pages
        except Exception as e:
            print(f"오류 발생: {e}")
            # 오류 시 모든 페이지를 대본 생성 필요로 처리 (빈 리스트)
            return []

    def invoke(self, pdf_contents: Dict[int, Dict]) -> Dict:
        """PDF 전체 검증 프로세스 실행."""
        print("="*60)
        print("PDF 검증 시작")
        print("="*60)

        # 1단계: 발표 자료 여부 판단
        presentation_result = self._check_presentation(pdf_contents)

        if not presentation_result.get("is_presentation"):
            # 발표 자료가 아니면 페이지 검증 없이 종료
            print("\n발표 자료가 아니므로 대본 생성을 진행하지 않습니다.")
            print("="*60)
            return {
                "is_presentation": False,
                "reason": presentation_result.get("reason"),
                "page_validations": {}
            }

        # 2단계: 대본 생성 불필요 페이지 찾기
        skip_pages = self._validate_pages(pdf_contents)

        # skip_pages에 없으면 True, 있으면 False
        page_dict = {
            page_num: (page_num not in skip_pages)
            for page_num in sorted(pdf_contents.keys())
        }

        needs_script_count = sum(1 for v in page_dict.values() if v)
        print("="*60)
        print(f"검증 완료: {needs_script_count}개 페이지 대본 생성 예정")
        print("="*60)

        return {
            "is_presentation": True,
            "reason": presentation_result.get("reason"),
            "page_validations": page_dict
        }

    def get_valid_pages(self, pdf_contents: Dict[int, Dict]) -> Dict[int, bool]:
        """대본 생성이 필요한 페이지 목록 반환."""
        result = self.invoke(pdf_contents)

        if not result.get("is_presentation"):
            return {}

        return result.get("page_validations", {})
