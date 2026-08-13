from app.agents.state import AgentState
from langchain_groq import ChatGroq
from app.config import settings
import logfire


llm = ChatGroq(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL, temperature=0)

def planner_node(state: AgentState):
    """
    The Planner determines if a search is needed based on the ENTIRE conversation.
    Classifies queries into: CONVERSATIONAL, OUT_OF_SCOPE, or a refined search query.
    """
    # Get the conversation history (excluding the latest message)
    history = ""
    for msg in state["messages"][:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history += f"{role}: {msg['content']}\n"
    
    user_message = state["messages"][-1]["content"] if state["messages"] else ""
    
    prompt = f"""
    You are an intelligent Assistant Planner for NovaTech Solutions' internal knowledge base.
    Analyze the conversation history and the latest user message.
    
    CONVERSATION HISTORY:
    {history}
    
    LATEST MESSAGE:
    "{user_message}"
    
    Task:
    1. If the latest message is a greeting (hi, hello) or a question that can be answered using ONLY the conversation history above (e.g., "what did you just say", "can you elaborate"), respond with 'CONVERSATIONAL'.
    2. If the message is clearly unrelated to company knowledge (e.g., weather, sports scores, coding homework, personal advice, creative writing), respond with 'OUT_OF_SCOPE'.
    3. If it is a question about company policies, processes, benefits, engineering practices, security guidelines, onboarding, or any internal documentation that requires searching the knowledge base, output a refined search query.
    
    Output ONLY 'CONVERSATIONAL', 'OUT_OF_SCOPE', or the search query. Nothing else.
    """
    
    with logfire.span("🧠 Planner Decision"):
        decision = llm.invoke(prompt).content.strip()
        logfire.info(f"Intent identified: {decision}")
    
    if decision == "CONVERSATIONAL":
        return {
            "current_query": "CONVERSATIONAL",
            "status": "Handling conversationally (using memory)...",
            "plan": ["Intent: Conversational/Memory", "Retrieval: Skipped"]
        }
    
    if decision == "OUT_OF_SCOPE":
        return {
            "current_query": "OUT_OF_SCOPE",
            "status": "Query is outside knowledge base scope.",
            "plan": ["Intent: Out of Scope", "Retrieval: Skipped"]
        }
    
    return {
        "current_query": decision,
        "status": f"Searching knowledge base for: {decision}",
        "plan": ["Intent: Knowledge Search", f"Search Term: {decision}"]
    }
