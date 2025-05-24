# Guideline: LangGraph PDF Chat Agent Architecture

## Summary

This project implements a PDF-aware chatbot powered by LangGraph (Python), enhanced with routing via Graphiti and memory via Zep. Chat sessions are stored in Supabase and coordinated using Edge Functions deployed on Vercel. The frontend is built in Next.js.

---

## Key Concepts

### LangGraph Agent

- Implements a ReAct-style agent
- Accepts user message, current session metadata
- Calls tools (Graphiti, Zep, Supabase)
- Deployed using [LangSmith](https://smith.langchain.com)

### Graphiti

- Graph-based router to direct LangGraph memory/tool use
- Used to decide when to query Zep memory or summarize
- Configured via `graphiti.yaml`

### Zep

- Stores long-term memory of sessions (vector + chat)
- Used by LangGraph for memory retrieval and summary

### Supabase

- Stores chat sessions metadata:
  - `session_id`, `user_id`, `pdf_id`, `workspace_id`, `messages[]`
- Used via Edge Functions for reads/writes
- Enforces Row-Level Security for user-specific data

### Vercel Edge Functions

- Lightweight endpoints
- Injects context (e.g., session history) before calling LangGraph
- Can call Supabase or Graphiti API
- Executes close to the user (low-latency)

### Next.js App

- Provides UI for uploading PDFs and chatting
- Frontend uses `/api/chat` (Edge function) to send messages

---