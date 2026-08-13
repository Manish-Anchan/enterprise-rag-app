import logfire
from app.agents.state import AgentState
from langchain_groq import ChatGroq
from app.config import settings

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL, temperature=0)

def generate_node(state: AgentState):
    """
    Synthesizes a response using Documentation Context AND Conversation History.
    Handles three modes: CONVERSATIONAL, OUT_OF_SCOPE, and Knowledge Search.
    """
    query = state["current_query"]

    history_str = ""
    for msg in state["messages"][:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"{role}: {msg['content']}\n"

    user_msg = state["messages"][-1]["content"] if state["messages"] else ""

    # ── Mode 1: Out of Scope ──────────────────────────────────
    if query == "OUT_OF_SCOPE":
        logfire.info("Generating out-of-scope response.")
        content = (
            "I'm **NovaTech KnowledgeHub**, your internal knowledge assistant. "
            "I can help you find information about:\n\n"
            "- 📋 **Company policies** (remote work, leave, code of conduct)\n"
            "- 💰 **Benefits & compensation** (health insurance, 401k, stock options)\n"
            "- 💳 **Expenses & travel** (reimbursement, per diem, approval process)\n"
            "- 🔧 **Engineering processes** (SDLC, deployments, on-call, incident response)\n"
            "- 🔒 **Security policies** (data handling, access control, acceptable use)\n"
            "- 👋 **Onboarding** (first-week guide, tools setup, buddy system)\n"
            "- 📊 **Performance reviews** (review cycle, promotion criteria)\n\n"
            "I'm not able to help with questions outside of NovaTech's internal documentation. "
            "Try asking me something like *\"What's the remote work policy?\"* or "
            "*\"How do I submit an expense report?\"*"
        )
        return {
            "final_answer": content,
            "status": "Out of scope — redirected to knowledge base topics.",
            "plan": ["Response: Out of Scope Redirect"],
            "messages": [{"role": "assistant", "content": content}]
        }

    # ── Mode 2: Conversational (Memory-based) ─────────────────
    if query == "CONVERSATIONAL":
        logfire.info("Generating conversational response using memory.")
        prompt = f"""
        You are KnowledgeHub AI, a friendly and helpful internal knowledge assistant for NovaTech Solutions.
        Answer the user's latest message using the CONVERSATION HISTORY below.
        Be professional but warm. If you don't know the answer from the history, say so and suggest
        they ask a specific question about company policies or processes.

        CONVERSATION HISTORY:
        {history_str}

        LATEST MESSAGE:
        "{user_msg}"
        """
    # ── Mode 3: Knowledge Search (RAG) ────────────────────────
    else:
        logfire.info("Generating knowledge base response with RAG context.")
        max_context_chars = 25000
        full_context = ""

        for doc in state["documents"]:
            if len(full_context) + len(doc) < max_context_chars:
                full_context += doc + "\n\n"
            else:
                logfire.warning("Context truncated to fit LLM token limits.")
                break

        prompt = f"""
        You are KnowledgeHub AI, an internal knowledge assistant for NovaTech Solutions.
        Answer the employee's question using ONLY the DOCUMENTATION CONTEXT provided below.

        IMPORTANT RULES:
        - Answer ONLY based on the provided documentation context
        - Always cite which document or policy you're referencing (e.g., "According to the Remote Work Policy...")
        - If the answer is not in the provided context, clearly state: "I couldn't find this information in our knowledge base. Please contact [relevant department] for assistance."
        - Use clear formatting: headers, bullet points, and bold for key information
        - Be professional but approachable — you're helping a colleague
        - For HR questions, suggest contacting people@novatech.io for clarification
        - For engineering questions, suggest the relevant Slack channel or team lead

        DOCUMENTATION CONTEXT:
        {full_context}

        CONVERSATION HISTORY:
        {history_str}

        EMPLOYEE QUESTION:
        "{user_msg}"
        """

    with logfire.span("✍️ LLM Synthesis"):
        try:
            content = llm.invoke(prompt).content

            logfire.info("✅ Response synthesised via LLM.")
            plan_update = state["plan"]
            status = "Response generated."

            return {
                "final_answer": content,
                "status": status,
                "plan": plan_update,
                "messages": [{"role": "assistant", "content": content}]
            }

        except Exception as e:
            logfire.error(f"LLM Generation failed: {e}")
            raise e
