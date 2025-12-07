import uvicorn
from fastapi import FastAPI, HTTPException, APIRouter

from config import HOST, PORT
from core.service import PipeLogic
from controller.responses import SpeechRequest

router = APIRouter()
pipe = PipeLogic()

@router.post("/generate-script")
async def generate_script(pdfId: int, pdfName: str):
    """PDF에서 페이지별 대본 생성 후 전체 페이지 결과 반환."""
    try:
        return pipe.generate_script_for_pdf(pdfId, pdfName)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"대본 생성 실패: {e}")


@router.post("/speech")
async def speech(request: SpeechRequest):
    """대본을 오디오로 합성하여 파일로 저장 후 파일명 반환 (배치 처리)."""
    try:
        pdf_info = [{"pageNum": p.pageNum, "script": p.script} for p in request.pdfInfo]
        return pipe.synthesize_speech(request.pdfId, pdf_info)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS 합성 실패: {e}")


app = FastAPI(title="AP AI Service", version="0.1.0")
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("route:app", host=HOST, port=PORT, reload=True)
