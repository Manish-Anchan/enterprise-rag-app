# 🤖 Enterprise Agentic RAG Application

A production-grade **Retrieval-Augmented Generation (RAG)** system built with an agentic architecture. It uses a **LangGraph** state machine to orchestrate an intelligent multi-step pipeline — planning, retrieval, reranking, and response synthesis — all served through a **FastAPI** backend and a **Streamlit** chat interface with full **distributed tracing** via Pydantic Logfire.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| **Agentic RAG Pipeline** | LangGraph state machine with Planner → Retriever → Responder nodes |
| **Conversational Memory** | Thread-based memory via `MemorySaver` — the agent remembers past turns |
| **Semantic Reranking** | FlashRank cross-encoder (ONNX-optimized) re-scores retrieved chunks for precision |
| **Multi-Format Ingestion** | Supports PDF, HTML, DOCX, PPTX, and TXT out of the box |
| **Vector Search** | Qdrant Cloud with 3072-dim Gemini embeddings and cosine similarity |
| **Distributed Tracing** | End-to-end observability with Pydantic Logfire across both UI and backend |
| **Streaming Chat UI** | Streamlit dashboard with real-time character streaming and thought-process visibility |
| **Fallback Mechanisms** | PDF parsing fallback (pypdf → pdfplumber), embedding retry with exponential backoff |

---

## 🏗️ Architecture

```
┌─────────────────────┐       POST /query        ┌─────────────────────────────────┐
│                     │ ────────────────────────► │            FastAPI              │
│   Streamlit Chat    │                           │                                │
│       (UI)          │ ◄──────────────────────── │   LangGraph Agent Workflow:     │
│                     │       JSON Response       │                                │
└─────────────────────┘                           │  ┌──────────┐                  │
                                                  │  │ Planner  │ (Intent Router)  │
                                                  │  └────┬─────┘                  │
                                                  │       │                        │
                                                  │  ┌────▼──────────┐             │
                                                  │  │  Retriever    │             │
                                                  │  │ Qdrant Search │             │
                                                  │  │ + FlashRank   │             │
                                                  │  └────┬──────────┘             │
                                                  │       │                        │
                                                  │  ┌────▼─────┐                 │
                                                  │  │Responder │ (LLM Synthesis) │
                                                  │  └──────────┘                  │
                                                  └─────────────────────────────────┘
                                                            │
                                                  ┌─────────▼─────────┐
                                                  │   Qdrant Cloud    │
                                                  │  (Vector Store)   │
                                                  └───────────────────┘
```

### Agent Workflow

1. **Planner Node** — An LLM classifies user intent. Greetings and follow-ups are routed as `CONVERSATIONAL` (skips retrieval). Technical questions produce a refined search query.
2. **Retriever Node** — Embeds the query with Gemini, searches Qdrant for the top 15 candidates, then **reranks** them with FlashRank's cross-encoder to keep the top 5 most relevant chunks.
3. **Responder Node** — Synthesizes a grounded answer using the retrieved context and full conversation history.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **API Framework** | FastAPI + Uvicorn |
| **Agent Orchestration** | LangGraph (StateGraph) |
| **LLM** | Llama 3.3 70B via Groq |
| **Embeddings** | Gemini Embedding 2 Preview (3072-dim) |
| **Vector Database** | Qdrant Cloud (Cosine similarity) |
| **Reranking** | FlashRank (ms-marco-MiniLM-L-6-v2, local ONNX) |
| **Document Parsing** | pypdf, pdfplumber, BeautifulSoup4, python-docx, python-pptx, Unstructured |
| **Frontend** | Streamlit |
| **Observability** | Pydantic Logfire + Loguru |
| **Language** | Python |

---

## 📁 Project Structure

```
enterprise-rag-app/
├── app/
│   ├── main.py                          # FastAPI app — API endpoints
│   ├── config.py                        # Settings & environment variables
│   ├── agents/
│   │   ├── graph.py                     # LangGraph workflow definition
│   │   ├── state.py                     # AgentState TypedDict
│   │   └── nodes/
│   │       ├── planner.py               # Intent classification node
│   │       ├── retriever.py             # Vector search + reranking node
│   │       └── responder.py             # LLM response synthesis node
│   ├── ingestion/
│   │   ├── processor.py                 # Universal ingestion pipeline (CLI)
│   │   ├── loaders/
│   │   │   ├── pdf.py                   # PDF parser (pypdf + pdfplumber fallback)
│   │   │   ├── html.py                  # HTML parser (BeautifulSoup)
│   │   │   ├── office.py                # DOCX/PPTX parser (Unstructured)
│   │   │   └── text.py                  # Plain text loader
│   │   └── chunking/
│   │       └── splitter.py              # Paragraph-based text chunker
│   └── services/
│       └── retrieval/
│           ├── embeddings.py            # Gemini embedding service (with retry)
│           ├── qdrant_service.py        # Qdrant vector search client
│           └── ranking_service.py       # FlashRank semantic reranking
├── ui/
│   ├── app.py                           # Streamlit chat interface (local)
│   └── st_cloud_ui.py                   # Streamlit Cloud variant (WIP)
├── DATA/
│   ├── true_data/                       # Ground-truth docs (PPTX, DOCX, HTML, TXT)
│   └── noisy_sample_10/                 # Noisy/distractor PDFs for testing
├── processed_data/                      # Auto-generated chunked JSON metadata
├── requirements.txt
├── .env                                 # API keys (not committed)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- API keys for: **Groq**, **Gemini**, **Qdrant Cloud**
- (Optional) Pydantic Logfire token for observability

### 1. Clone the Repository

```bash
git clone https://github.com/Manish-Anchan/enterprise-rag-app.git
cd enterprise-rag-app
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_FALLBACK_API_KEY=your_fallback_key        # optional
GEMINI_API_KEY=your_gemini_api_key
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_CLUSTER_ENDPOINT=https://your-cluster.cloud.qdrant.io
LOGFIRE_TOKEN=your_logfire_token                # optional
```

### 5. Ingest Documents

Place your documents in the `DATA/` directory, then run:

```bash
# Ingest all documents (wipes the existing collection first)
python -m app.ingestion.processor DATA --wipe

# Or ingest a specific subdirectory
python -m app.ingestion.processor DATA/true_data true
```

### 6. Start the Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### 7. Start the Frontend

```bash
streamlit run ui/app.py
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — confirms API is live |
| `GET` | `/graph` | Returns a Mermaid PNG of the agent workflow |
| `POST` | `/query` | Execute the RAG pipeline with a question |

### `POST /query` — Request Body

```json
{
  "q": "How does Kubernetes handle pod autoscaling?",
  "thread_id": "user_123"
}
```

### Response

```json
{
  "question": "How does Kubernetes handle pod autoscaling?",
  "answer": "Kubernetes uses the Horizontal Pod Autoscaler (HPA)...",
  "thought_process": ["Intent: Technical", "Search Term: Kubernetes pod autoscaling", "Context Retrieved"],
  "status": "Response generated.",
  "sources": ["CONTENT: ..."]
}
```

---

## 🔍 Observability

The entire system is instrumented with **Pydantic Logfire**:

- **Distributed traces** propagate from the Streamlit UI → FastAPI backend → LLM calls
- Every pipeline stage (planning, retrieval, reranking, synthesis) is captured as a **span**
- Errors, rate limits, and fallbacks are logged with context
- Session IDs track individual user conversations

---

## 📄 Supported Document Formats

| Format | Parser | Notes |
|---|---|---|
| PDF | `pypdf` + `pdfplumber` fallback | Handles text-based and scanned PDFs |
| HTML | `BeautifulSoup4` | Strips scripts/styles, extracts clean text |
| DOCX | `Unstructured` | Via `python-docx` backend |
| PPTX | `Unstructured` | Via `python-pptx` backend |
| TXT | Built-in | UTF-8 plain text |

---

## 🧠 How the RAG Pipeline Works

```
User Query
    │
    ▼
┌─────────┐   "CONVERSATIONAL"   ┌───────────┐
│ Planner ├──────────────────────►│ Responder │──► Final Answer
└────┬────┘                      └───────────┘
     │ Search Query                    ▲
     ▼                                 │
┌───────────┐   Top 5 chunks    ┌──────┴────┐
│ Retriever ├──────────────────►│ Responder │──► Final Answer
│           │                   └───────────┘
│ Qdrant    │
│ (top 15)  │
│     ↓     │
│ FlashRank │
│ (top 5)   │
└───────────┘
```

1. **Query Planning** — LLM decides: is this conversational or does it need a knowledge search?
2. **Vector Retrieval** — Query is embedded with Gemini and searched against Qdrant (top 15 candidates)
3. **Cross-Encoder Reranking** — FlashRank re-scores candidates semantically (keeps top 5)
4. **Answer Synthesis** — LLM generates a grounded response using retrieved context + conversation history

---

## 📝 License

This project is for educational and portfolio purposes.
