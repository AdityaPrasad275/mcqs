# NCERT MCQ Generator MVP

This project provides a simple web application to generate Multiple Choice Questions (MCQs) for NCERT topics using Google Gemini AI, and allows users to export these MCQs into a cleanly formatted Word (.docx) document.

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

a.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

b.  **(Recommended) Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    ```
    *   On Windows: `venv\Scripts\activate`
    *   On macOS/Linux: `source venv/bin/activate`

c.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

d.  **Set up your Google Gemini API Key:**
    *   Create a file named `.env` in the `backend` directory.
    *   Add your API key to it:
        ```env
        GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
        ```
    *   **Important:** Replace `"YOUR_GEMINI_API_KEY"` with your actual key obtained from [Google AI Studio](https://aistudio.google.com/app/apikey). Do not commit this file to version control.

e.  **Run the Flask backend server:**
    ```bash
    flask run
    ```
    By default, it will run on `http://127.0.0.1:5000`. Keep this terminal open.

### 2. Frontend Setup (Vite + React + pnpm)

a.  **Navigate to the frontend directory (from the project root):**
    ```bash
    cd frontend
    ```

b.  **Install Node.js dependencies using pnpm:**
    ```bash
    pnpm install
    # Ensure axios is installed: pnpm add axios
    ```

c.  **Configure API Proxy:**
    *   The `frontend/vite.config.js` file is configured to proxy API requests from `/api` to the Flask backend (`http://127.0.0.1:5000`) during development. No manual changes are usually needed here unless your backend port changes.

d.  **Run the Vite development server:**
    ```bash
    pnpm run dev
    ```
    This will usually open the app in your browser at `http://localhost:5173` (Vite's default port, check your terminal output for the exact URL). Keep this terminal open.

### 3. Using the Application

1.  Ensure both the backend and frontend servers are running.
2.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
3.  Enter the "Topic Name" for which you want to generate MCQs.
4.  (Optional) Paste relevant chapter content into the "Paste Chapter Content" text area.
5.  (Optional) Paste any Previous Year Questions (PYQs) into the "Paste PYQs" text area for context.
6.  Click the "Generate MCQs" button.
7.  The generated MCQs will appear in the editable text area below. You can make any necessary edits.
8.  Click the "Export as Word (.docx)" button to download the MCQs as a Word document. The filename will be dynamically generated based on your topic name.

## Tech Stack

*   **Frontend:** React (with Vite for fast development), powered by `pnpm` for package management.
*   **Backend:** Python (Flask) for handling API requests and file generation.
*   **AI:** Google Gemini (`gemini-2.0-flash`) for generating MCQs.
*   **Export:** `python-docx` for robust Word (.docx) document creation.
*   **API Communication:** `axios` (frontend) and `Flask-CORS` (backend) for seamless cross-origin requests.