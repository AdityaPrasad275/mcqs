# NCERT MCQ Generator MVP

This project allows users to generate Multiple Choice Questions (MCQs) for NCERT topics using AI (Google Gemini) and export them as Word (.docx) or PDF documents.

## Project Structure

```
mcqs/
├── backend/ # Python Flask Backend
│ ├── app.py
│ ├── requirements.txt
│ └── .env # For API keys (GITIGNORED)
├── frontend/ # Vite React Frontend
│ ├── .gitignore
│ ├── eslint.config.js
│ ├── index.html
│ ├── package.json
│ ├── README.md
│ ├── vite.config.js
│ ├── public/
│ └── src/
│ ├── App.css
│ ├── App.jsx
│ ├── index.css
│ └── main.jsx
└── README.md (This file)
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
    *   Replace `"YOUR_GEMINI_API_KEY"` with your actual key.

e.  **Run the Flask backend server:**
    ```bash
    flask run
    ```
    By default, it will run on `http://127.0.0.1:5000`.

### 2. Frontend Setup (Vite + React + pnpm)

a.  **Navigate to the frontend directory (from the root project folder):**
    ```bash
    cd ../frontend
    # Or if you are in the root: cd frontend
    ```

b.  **Install Node.js dependencies using pnpm:**
    ```bash
    pnpm install
    ```
    (Make sure you have `axios` listed in your `package.json` or run `pnpm add axios`)

c.  **Configure API Proxy:**
    *   Open `frontend/vite.config.js`.
    *   Modify it to include a server proxy configuration (see the `vite.config.js` content below). This is crucial for API calls to the backend during development.

d.  **Run the Vite development server:**
    ```bash
    pnpm run dev
    ```
    This will usually open the app in your browser at `http://localhost:5173` (Vite's default port, can vary). Check your terminal output for the exact URL.

### 3. Using the Application

1.  Open your browser and go to the URL provided by `pnpm run dev` (e.g., `http://localhost:5173`).
2.  Enter the "Topic Name".
3.  (Optional) Paste chapter content.
4.  (Optional) Paste PYQs.
5.  Click "Generate MCQs".
6.  Edit MCQs if needed.
7.  Export as Word or PDF.

## Tech Stack

*   **Frontend:** React (with Vite), pnpm
*   **Backend:** Python (Flask)
*   **AI:** Google Gemini
*   **Export:**
    *   Word (.docx): `python-docx`
    *   PDF: `fpdf2`
*   **API Communication:** `axios` (frontend), `Flask-CORS` (backend)