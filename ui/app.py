import os
import streamlit as st
import requests
import time
import uuid
import logfire
from dotenv import load_dotenv


# Load environment variables explicitly from the root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=env_path)


# Initialize Logfire
try:
    token = os.getenv("LOGFIRE_TOKEN")
    if token:
        logfire.configure(token=token)
    LOGFIRE_STATUS = "Connected & Tracing" if token else "Disabled"
except Exception as e:
    LOGFIRE_STATUS = f"Standby ({e})"


# --- PAGE CONFIG ---
st.set_page_config(
    page_title="NovaTech KnowledgeHub",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded",
)


# --- CUSTOM CSS ---
st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Global */
    .stApp {
        font-family: 'Inter', sans-serif;
    }

    /* Hero Section */
    .hero-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        border-radius: 16px;
        padding: 2.5rem 2rem;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(99, 102, 241, 0.2);
        position: relative;
        overflow: hidden;
    }
    .hero-container::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
        animation: pulse 4s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 1; }
    }
    .hero-title {
        font-size: 2rem;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 0.5rem;
        position: relative;
    }
    .hero-subtitle {
        font-size: 1rem;
        color: #94a3b8;
        font-weight: 300;
        position: relative;
    }

    /* Category Cards */
    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .category-card {
        background: linear-gradient(135deg, #1e293b, #334155);
        border: 1px solid rgba(148, 163, 184, 0.1);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: default;
    }
    .category-card:hover {
        border-color: rgba(99, 102, 241, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
    }
    .category-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
    }
    .category-label {
        font-size: 0.8rem;
        color: #cbd5e1;
        font-weight: 500;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a, #1e293b);
    }
    section[data-testid="stSidebar"] .stMarkdown h1,
    section[data-testid="stSidebar"] .stMarkdown h2,
    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #f1f5f9;
    }

    /* Status Badges */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    .status-online {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .status-guarded {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
    }

    /* Chat Messages */
    .stChatMessage {
        border-radius: 12px;
        margin-bottom: 0.5rem;
    }

    /* Source Citation */
    .source-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 8px;
        font-size: 0.75rem;
        color: #818cf8;
        margin: 2px;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Divider */
    .custom-divider {
        border: none;
        border-top: 1px solid rgba(148, 163, 184, 0.1);
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)


# --- AVATARS ---
AI_AVATAR = "🏢"
USER_AVATAR = "👤"


# --- SESSION MANAGEMENT ---
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
    logfire.info(f"✨ New User Session Created: {st.session_state.session_id}")

if "messages" not in st.session_state:
    st.session_state.messages = []


# --- SIDEBAR ---
with st.sidebar:
    st.markdown("### 🏢 NovaTech KnowledgeHub")
    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)

    # Status Indicators
    st.markdown(
        '<span class="status-badge status-online">● RAG Pipeline Active</span>',
        unsafe_allow_html=True
    )
    st.markdown(
        '<span class="status-badge status-guarded">🛡️ Guardrails Enabled</span>',
        unsafe_allow_html=True
    )

    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)

    # System Info
    st.markdown("**System Info**")
    st.caption(f"🔗 Session: `{st.session_state.session_id[:8]}`")
    st.caption(f"📡 Logfire: {LOGFIRE_STATUS}")
    st.caption(f"🧠 Memory: Thread-based (MemorySaver)")

    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)

    # Architecture Info
    with st.expander("⚙️ RAG Pipeline Architecture"):
        st.markdown("""
        ```
        User Query
            │
            ▼
        🛡️ NeMo Guardrails
        (Jailbreak / Off-topic filter)
            │
            ▼
        🧠 Planner Node
        (Intent Classification)
            │
        ┌───┴───┐
        │       │
        ▼       ▼
        🔍      💬
        Retriever   Responder
        (Qdrant +   (Memory-based
        FlashRank)   response)
            │
            ▼
        ✍️ Responder
        (LLM Synthesis)
        ```
        """)

    st.markdown('<hr class="custom-divider">', unsafe_allow_html=True)

    if st.button("🗑️ Clear History & Memory", use_container_width=True, type="primary"):
        logfire.warn(f"🗑️ Memory Wipe Triggered for session: {st.session_state.session_id}")
        st.session_state.messages = []
        st.session_state.session_id = str(uuid.uuid4())
        st.rerun()


# --- HERO SECTION ---
st.markdown("""
<div class="hero-container">
    <div class="hero-title">🏢 NovaTech KnowledgeHub</div>
    <div class="hero-subtitle">Your company's brain, instantly searchable — powered by agentic RAG with guardrails</div>
</div>
""", unsafe_allow_html=True)


# --- CATEGORY CARDS (only show when no messages) ---
if not st.session_state.messages:
    st.markdown("""
    <div class="category-grid">
        <div class="category-card">
            <div class="category-icon">💼</div>
            <div class="category-label">HR Policies</div>
        </div>
        <div class="category-card">
            <div class="category-icon">💰</div>
            <div class="category-label">Benefits & Comp</div>
        </div>
        <div class="category-card">
            <div class="category-icon">🔧</div>
            <div class="category-label">Engineering</div>
        </div>
        <div class="category-card">
            <div class="category-icon">🔒</div>
            <div class="category-label">Security</div>
        </div>
        <div class="category-card">
            <div class="category-icon">👋</div>
            <div class="category-label">Onboarding</div>
        </div>
        <div class="category-card">
            <div class="category-icon">📊</div>
            <div class="category-label">Performance</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Example questions
    st.markdown("**💡 Try asking:**")
    col1, col2 = st.columns(2)
    with col1:
        st.caption("• What is NovaTech's remote work policy?")
        st.caption("• How do I submit an expense report?")
        st.caption("• What's the on-call compensation?")
    with col2:
        st.caption("• What are the PR review requirements?")
        st.caption("• How does the performance review work?")
        st.caption("• What health insurance plans are available?")


# --- CHAT HISTORY ---
for message in st.session_state.messages:
    avatar = AI_AVATAR if message["role"] == "assistant" else USER_AVATAR
    with st.chat_message(message["role"], avatar=avatar):
        st.markdown(message["content"])


# --- CHAT INPUT ---
if prompt := st.chat_input("Ask about NovaTech policies, processes, benefits..."):
    with logfire.span("💬 User Chat Interaction", user_query=prompt, session_id=st.session_state.session_id):

        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar=USER_AVATAR):
            st.markdown(prompt)

        # Assistant Response
        with st.chat_message("assistant", avatar=AI_AVATAR):
            with st.status("🔍 Processing your query...", expanded=True) as status:
                try:
                    with logfire.span("📡 Calling RAG Backend"):
                        base_url = os.getenv("BACKEND_URL", "http://localhost:8080")
                        url = f"{base_url}/query"
                        payload = {"q": prompt, "thread_id": st.session_state.session_id}
                        response = requests.post(url, json=payload, timeout=60)
                        data = response.json()

                    # Show the thought process / reasoning steps
                    steps = data.get("thought_process", [])
                    for step in steps:
                        st.write(f"⚙️ {step}")

                    # Check if guardrails blocked the query
                    if data.get("status") == "Blocked by guardrails.":
                        status.update(label="🛡️ Guardrails Activated", state="complete", expanded=False)
                    else:
                        status.update(label="✅ Answer Synthesized", state="complete", expanded=False)

                    # Show retrieved sources
                    sources = data.get("sources", [])
                    if sources:
                        with st.expander(f"📄 Sources ({len(sources)} documents referenced)"):
                            for i, source in enumerate(sources):
                                preview = source[:120].replace("\n", " ") + "..."
                                with st.expander(f"📋 Chunk {i+1}: {preview}"):
                                    st.info(source)

                except Exception as e:
                    logfire.error(f"❌ UI-Backend Connection Failed: {e}")
                    status.update(label="❌ Connection Failed", state="error")
                    st.error(
                        "Could not connect to the backend API. "
                        "Make sure the server is running with: "
                        "`uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload`"
                    )
                    st.stop()

            # Streaming animation for the final answer
            answer_placeholder = st.empty()
            full_answer = data.get("answer", "No response received.")

            curr_text = ""
            for char in full_answer:
                curr_text += char
                answer_placeholder.markdown(curr_text + "▌")
                time.sleep(0.005)

            answer_placeholder.markdown(full_answer)
            st.session_state.messages.append({"role": "assistant", "content": full_answer})
            logfire.info("✅ Chat cycle completed successfully.")
