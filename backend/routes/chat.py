from fastapi import APIRouter, HTTPException
from schemas.chat import ChatRequest, ChatResponse
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def chat_with_chef(request: ChatRequest):
    if not request.messages or len(request.messages) == 0:
        raise HTTPException(status_code=400, detail="At least one message is required.")

    return gemini_service.chat(
        messages=request.messages,
        recipe_context=request.recipe_context,
        current_step=request.current_step,
    )
