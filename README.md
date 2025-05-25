# NCERT MCQ Generator MVP

This project provides a simple web application to generate Multiple Choice Questions (MCQs) for NCERT topics using Google Gemini AI. Users can export these MCQs into a cleanly formatted Word (.docx) document (server-generated) or a structured PDF document (client-generated).


## Project Structure

```
adityaprasad275-mcqs/
├── backend/ # Python Flask Backend
│ ├── app.py
│ ├── requirements.txt
│ └── .env # For API keys (GITIGNORED)
├── frontend/ # Vite React Frontend
│ ├── public/
│ ├── src/
│ ├── package.json
│ ├── vite.config.js
│ └── ... (other Vite/React files)
├── docs/ # Documentation and Future Plans
│ └── plan.md
└── README.md # (This file)
```


## Setup and Running

### 1. Backend Setup (Flask & Gemini)
*(No changes to setup instructions from the Word-only MVP)*
... (keep existing backend setup steps) ...

### 2. Frontend Setup (Vite + React + pnpm)
a.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
b.  **Install Node.js dependencies using pnpm:**
    ```bash
    pnpm install
    # Ensure axios, jspdf, and jspdf-autotable are installed:
    # pnpm add axios jspdf jspdf-autotable
    ```
c.  **Configure API Proxy:** (No changes needed in `vite.config.js`)
d.  **Run the Vite development server:**
    ```bash
    pnpm run dev
    ```
    It will usually open at `http://localhost:5173`.

### 3. Using the Application
*(Adjust to include PDF export option)*
1.  Ensure both backend and frontend servers are running.
2.  Open your browser to the frontend URL.
3.  Enter Topic Name, optional Chapter Content, and optional PYQs.
4.  Click "Generate MCQs".
5.  Edit MCQs if needed in the text area.
6.  Click "Export as Word (.docx)" to download a server-generated Word file.
7.  Click "Export as PDF" to download a client-generated PDF file.

## Tech Stack

*   **Frontend:** React (with Vite), `pnpm`
    *   **PDF Generation:** `jspdf`, `jspdf-autotable`
*   **Backend:** Python (Flask)
*   **AI:** Google Gemini (`gemini-2.0-flash`)
*   **Export:**
    *   Word (.docx): `python-docx` (server-side)
    *   PDF (.pdf): `jspdf`, `jspdf-autotable` (client-side)
*   **API Communication:** `axios` (frontend) and `Flask-CORS` (backend) for seamless cross-origin requests.