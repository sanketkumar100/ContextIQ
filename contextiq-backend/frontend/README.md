# ContextIQ Frontend ⚡ AI RAG

An AI-Powered Document Intelligence System (RAG) frontend built with **React**, **Tailwind CSS**, and **Vite**, designed to work seamlessly with the ContextIQ Spring AI backend.

---

## 🚀 Features

1. **Multi-Document Upload & Progress Bar**:
   - Upload single or multiple documents (`.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.csv`) with drag-and-drop.
   - Real-time progress bar for each file and overall upload batch.
   - Automatic token chunking and pgvector embedding tracking.

2. **Conversational AI & Chat Sessions**:
   - Full chat session selector: switch between previous conversations, create new chats, rename, and delete sessions.
   - Real-time Server-Sent Events (SSE) token streaming via `/api/v1/chat/stream`.
   - Standard grounded Q&A with source citations via `/api/v1/chat/query`.
   - Chat export to Markdown and one-click chat clearing.

3. **Feature Templates (Empty State / Quick Prompts)**:
   - **Summarize Key Points**: Summarize executive highlights of documents.
   - **Interview / Q&A Insights**: Extract critical questions and answers.
   - **Action Items & Deadlines**: List actionable takeaways and responsibilities.
   - **Technical Concepts**: Explain system architecture and technical topics.

4. **Semantic Vector Similarity Search (Cmd+K)**:
   - Inspect vector chunks by searching concepts, clauses, and facts across the corpus.
   - Displays similarity score matches, chunk index, page numbers, and text snippets.

5. **Document Chunks Information Modal**:
   - Detailed modal showing document ID, size, vector chunks, total pages, and uploaded date.
   - Full vector chunk preview (`Chunk #0`, `Chunk #1`, etc.) formatted with monospace styling.
   - One-click "Chat with Document" and document deletion with vector store purge.

6. **Scope Filtering & Dark Theme**:
   - Switch scope between "All Documents" and individual documents.
   - Real-time file filter in Knowledge Base sidebar.
   - Polished dark UI matching the ContextIQ screenshots, with light mode toggle.

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 3. Backend Proxy
The Vite configuration proxies all `/api` requests to the Spring Boot backend at `http://localhost:8081`. Ensure the ContextIQ Spring Boot backend is running.

### 4. Build for Production
```bash
npm run build
```
The output will be in `dist/`.
