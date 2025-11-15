import os
from loaders.pdf_loader import PDFLoader
from core.script_generator.script_generator import ScriptGenerator


def main():
    pdf_path = "../../test_data/PAI.pdf"

    if not os.path.exists(pdf_path):
        print(f"파일을 찾을 수 없습니다: {pdf_path}")
        return

    print("\n" + "="*50)
    print("PDF 로딩 중...")
    print("="*50)

    pdf_loader = PDFLoader.from_path(pdf_path)
    pdf_loader.summary()

    print("\n" + "="*50)
    print("발표 대본 생성 시작")
    print("="*50)

    generator = ScriptGenerator()
    scripts = generator.generate_script(pdf_loader.pdf_contents)

    print("\n" + "="*50)
    print("생성된 발표 대본")
    print("="*50)

    if isinstance(scripts, list):
        for idx, script in enumerate(scripts, 1):
            print(f"\n[페이지 {idx}]")
            print(script)
            print("-" * 50)
    else:
        print(scripts)

    save = input("\n\n결과를 파일로 저장하시겠습니까? (y/n): ").strip().lower()
    if save == "y":
        output_path = "generated_script.txt"
        with open(output_path, "w", encoding="utf-8") as f:
            if isinstance(scripts, list):
                for idx, script in enumerate(scripts, 1):
                    f.write(f"[페이지 {idx}]\n")
                    f.write(script)
                    f.write("\n\n" + "="*50 + "\n\n")
            else:
                f.write(str(scripts))
        print(f"결과가 {output_path}에 저장되었습니다.")


if __name__ == "__main__":
    main()
