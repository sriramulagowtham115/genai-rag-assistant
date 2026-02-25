# 🧠 Production-Grade GenAI Assistant with RAG (Fully Local)

## 📌 Overview

This project implements a Retrieval-Augmented Generation (RAG) based GenAI Assistant.

The system retrieves relevant document chunks using semantic embeddings and cosine similarity, then generates grounded responses using retrieved context.

This implementation runs fully locally using transformer-based embeddings (MiniLM).

---

## 🏗️ Architecture
User (React Frontend)
↓
POST /api/chat
↓
Express Backend
↓

Generate query embedding

Perform cosine similarity search

Retrieve Top-3 relevant chunks

Apply similarity threshold

Generate grounded response

Return structured JSON

---

## 🧠 RAG Workflow

1. Load documents from `docs.json`
2. Chunk documents (300–500 characters)
3. Generate embeddings using MiniLM transformer
4. Store vectors in memory
5. On user query:
   - Generate query embedding
   - Compute cosine similarity
   - Retrieve top 3 chunks
   - Inject context into response
6. Return grounded answer

---

## 🔬 Embedding Strategy

Model Used:

Why MiniLM?
- Lightweight
- Fast
- Produces high-quality semantic embeddings
- Suitable for local deployment

Embedding Technique:
- Mean pooling
- L2 normalization
- Cosine similarity

---

## 📐 Similarity Search

We implemented cosine similarity:
similarity = dot(A,B) / (|A| × |B|)

- Threshold applied (0.5)
- Top-3 chunks retrieved
- Ensures semantic matching
- Prevents keyword-based retrieval

---

## 🛡 Hallucination Prevention

To prevent hallucinations:

- Only retrieved context is used
- No external knowledge is injected
- If similarity is low → return safe fallback:
"I do not have enough information."

---

## 💬 API Specification

### POST `/api/chat`

Request:

{
"sessionId": "abc123",
"message": "How can I reset my password?"
}
Response:

{
  "reply": "...generated response...",
  "retrievedChunks": 3
}

Frontend Features

Chat UI

Session handling via localStorage

Scroll to bottom

Loading indicator

User & Assistant message separation


Setup Instructions
Backend
cd backend
npm install
node server.js

Frontend
cd frontend
npm install
npm start


Tech Stack

Node.js

Express.js

React.js

Xenova Transformers

Cosine Similarity

In-memory Vector Storage