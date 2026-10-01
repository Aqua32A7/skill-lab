from typing import List, Optional, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")
    timestamp: Optional[str] = Field(default=None)

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1)
    recipe_context: Optional[dict] = Field(default=None, description="Current recipe details if inside cooking mode or detail page")
    current_step: Optional[int] = Field(default=None, description="Active step number if in step-by-step cooking mode")

class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = Field(default_factory=list, description="Follow-up quick suggestions")
