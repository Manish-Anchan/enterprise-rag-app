import logfire
import os
from dotenv import load_dotenv

load_dotenv()
logfire.configure(token=os.getenv("LOGFIRE_TOKEN"))

from fastapi import FastAPI, HTTPException
from app.agents.graph import rag_agent
from app.guardrails import initialize_rails, guard

from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager


class QueryRequest(BaseModel):
    q: str
    thread_id: Optional[str] = "default_user"
    


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI startup and shutdown."""
    initialize_rails()
    yield




app = FastAPI(
    title="NovaTech KnowledgeHub API",
    description="AI-powered internal knowledge base for NovaTech Solutions",
    version="1.0.0",
    lifespan=lifespan,
)




@app.get("/")
def home():
    return {"message": "NovaTech KnowledgeHub API is live.", "status": "healthy"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring and container orchestration."""
    return {
        "status": "healthy",
        "service": "NovaTech KnowledgeHub",
        "components": {
            "api": "up",
            "guardrails": "enabled",
            "agent": "ready",
        }
    }


@app.get("/graph")
def get_graph_image():
    """
    Returns the Mermaid image of the agent's workflow.
    """
    from fastapi import Response
    try:
        png_bytes = rag_agent.get_graph().draw_mermaid_png()
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate graph image: {e}"
        )
    
    
@app.post("/query")
def query(request: QueryRequest):
    """
    Executes the LangGraph RAG flow with memory using a POST request.
    Input is first evaluated against NeMo Guardrails before reaching the pipeline.
    """
    q = request.q
    thread_id = request.thread_id

    initial_state = {
        "messages": [{"role": "user", "content": q}],
        "current_query": q,
        "documents": [],
        "plan": ["Start"],
        "status": "Initializing Graph..."
    }
    

    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        rail_fired, rail_response = guard(q)
        if rail_fired:
            logfire.info(f"🛡️ Request blocked by guardrails | thread={thread_id}")
            return {
                "question": q,
                "answer": rail_response,
                "thought_process": ["🛡️ Guardrails Activated", "Query blocked by safety filters"],
                "status": "Blocked by guardrails.",
                "sources": []
            }

        final_output = rag_agent.invoke(initial_state, config=config)
        
        return {
            "question": q,
            "answer": final_output.get("final_answer"),
            "thought_process": final_output.get("plan"),
            "status": final_output.get("status"),
            "sources": final_output.get("documents", [])
        }
    except Exception as e:
        logfire.error(f"❌ Backend Execution Failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "question": q,
                "answer": "I apologize, but I encountered an internal error while processing your request. Please try again later.",
                "thought_process": ["Error encountered during execution."],
                "status": "error",
                "sources": []
            }
        )
