# AI Server

이것은 Python을 다를줄도 모르는 누군가들을 준비한 md파일입니다. Trash 2명은 이것을 보고 따라 하시면 됩니다.

## 환경 설정

### 1. Python 설치

Python 3.10 이상 필요. [python.org](https://www.python.org/downloads/)에서 다운로드.

설치 확인:
```bash
python --version
```

### 2. 가상환경 생성

```bash
cd back/AI

# 가상환경 생성 (.venv 폴더가 생김)
python -m venv .venv

# 가상환경 활성화 (Windows) 혹시나 Mac이면 알아서 검색ㄱㄱ
.venv\Scripts\activate

```

활성화되면 터미널 앞에 `(.venv)` 표시됨.



### 3. 의존성 설치

가상환경 활성화 상태에서:
```bash
pip install -r requirements.txt
```

### 4. 환경변수 설정

`back/AI/`에 `.env` 파일 생성 -> 이거는 Google API Key 발급받아야함
```
#.env
GOOGLE_API_KEY= 여기다가 니가 발급받은 API Key 넣어 
```

## 서버 실행

```bash
# AI경로 들어와서 이렇게 하거나(밑에껀 참고로 나도 안쳐봄)
cd back/AI
python route.py

# Root에서 아래 명령어 입력하든가
uvicorn back.AI.route:app --host 127.0.0.1 --port 8000
```

기본: `http://127.0.0.1:8000`

HOST/PORT 변경은 `config/env.py` 드가면 PORT랑 HOST 바꾸면됨 

## 출력 파일 위치
일단은 여기에 생기게 해뒀음 난중에 DB 만들고 그때 다시 경로랑 정할거임

- 대본: `test_data/texts/{pdfId}_p{page}.txt`
- 오디오: `test_data/audio/{pdfId}_p{page}.wav`

## 디렉토리 구조

```
back/AI/
├── route.py                 # FastAPI 엔트리포인트
├── requirements.txt
├── config/
│   ├── env.py               # 환경변수, 경로 상수
│   ├── model_param/         # LLM/VLM 모델 파라미터
│   └── prompts/             # 프롬프트 템플릿
├── controller/
│   ├── pdf_loader.py        # PDF 텍스트/이미지 추출
│   ├── exporter.py          # 출력 경로 관리
│   └── responses.py         # API 응답 스키마
├── core/
│   ├── service.py           # PipeLogic (메인 파이프라인)
│   ├── base_model.py        # LLM/VLM 베이스 클래스
│   ├── script/              # 대본 생성, 이미지 분석
│   └── tts/                 # TTS 엔진
└── utils/
    └── utils.py             # 공통 유틸리티
```