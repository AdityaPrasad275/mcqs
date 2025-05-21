# Technical Overview: NCERT MCQ Generator MVP

This document provides a technical deep-dive into the current architecture and implementation of the NCERT MCQ Generator MVP (Version 1.0).

## Table of Contents

1.  [High-Level Architecture](#1-high-level-architecture)
2.  [Backend (Flask - Python)](#2-backend-flask---python)
    *   [2.1. Core Dependencies](#21-core-dependencies)
    *   [2.2. Directory Structure](#22-directory-structure)
    *   [2.3. Key File: `app.py`](#23-key-file-apppy)
        *   [2.3.1. Initialization & Configuration](#231-initialization--configuration)
        *   [2.3.2. Gemini AI Integration](#232-gemini-ai-integration)
        *   [2.3.3. API Endpoints](#233-api-endpoints)
        *   [2.3.4. Word Export Logic](#234-word-export-logic)
    *   [2.4. Environment Variables](#24-environment-variables)
3.  [Frontend (React - Vite)](#3-frontend-react---vite)
    *   [3.1. Core Dependencies](#31-core-dependencies)
    *   [3.2. Directory Structure](#32-directory-structure)
    *   [3.3. Key Files & Components](#33-key-files--components)
        *   [3.3.1. `index.html`](#331-indexhtml)
        *   [3.3.2. `src/main.jsx`](#332-srcmainjsx)
        *   [3.3.3. `src/App.jsx` (Main Application Component)](#333-srcappjsx-main-application-component)
        *   [3.3.4. `src/App.css` & `src/index.css`](#334-srcappcss--srcindexcss)
        *   [3.3.5. `vite.config.js`](#335-viteconfigjs)
    *   [3.4. State Management](#34-state-management)
    *   [3.5. API Communication](#35-api-communication)
4.  [Data Flow for MCQ Generation & Export](#4-data-flow-for-mcq-generation--export)

---

## 1. High-Level Architecture

The application follows a client-server architecture:

*   **Frontend (Client):** A Single Page Application (SPA) built with React and Vite. It handles user interaction, collects input, displays generated MCQs, and initiates export requests.
*   **Backend (Server):** A Python Flask application that serves as an API. It processes requests from the frontend, interacts with the Google Gemini API for MCQ generation, and handles the creation of Word documents for export.

Communication between frontend and backend is via HTTP requests to defined API endpoints.

---

## 2. Backend (Flask - Python)

The backend is responsible for the core logic of MCQ generation and file export.

### 2.1. Core Dependencies

(As defined in `backend/requirements.txt`)

*   **`Flask`**: A micro web framework for creating the API server.
*   **`Flask-CORS`**: Handles Cross-Origin Resource Sharing, allowing the frontend (running on a different port) to make requests to the backend.
*   **`google-generativeai`**: The official Python SDK for interacting with the Google Gemini API.
*   **`python-docx`**: Used to create and manipulate Word (.docx) documents.
*   **`python-dotenv`**: Manages environment variables, primarily for the Gemini API key.
*   **`unicodedata`, `re`**: Standard Python libraries used for text cleaning and sanitization, particularly for filenames.

### 2.2. Directory Structure

```
backend/
├── app.py           # Main Flask application file
├── requirements.txt # Python dependencies
└── .env             # (Gitignored) Stores the Google API key
```
*(A `venv/` directory for the virtual environment is typically present but gitignored).*

### 2.3. Key File: `app.py`

This file contains all the backend logic.

#### 2.3.1. Initialization & Configuration

*   **Flask App Creation:** `app = Flask(__name__)` initializes the Flask application.
*   **CORS:** `CORS(app)` enables CORS for all routes.
*   **Gemini API Key Loading:** `load_dotenv()` loads variables from the `.env` file. The `GOOGLE_API_KEY` is retrieved using `os.getenv("GOOGLE_API_KEY")`.
*   **Gemini Model Initialization:**
    ```python
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    ```
    This configures the `google-generativeai` library with the API key and specifies the `gemini-2.0-flash` model for content generation. Error handling is in place if the API key is missing or configuration fails.

#### 2.3.2. Gemini AI Integration

*   **`generate_mcqs_with_gemini(topic_name, chapter_content, pyqs)` function:**
    *   Constructs a detailed prompt for the Gemini API. The prompt instructs the AI on its role, the desired output format (5 MCQs with specific structure: Question, Options A-D, Answer), and incorporates the user-provided topic name, chapter content, and PYQs.
    *   Uses `model.generate_content(prompt)` to send the request to Gemini.
    *   Extracts the text response (the generated MCQs) from the API's output.
    *   Includes error handling for API call failures or if the API filters content.

#### 2.3.3. API Endpoints

*   **`/api/generate-mcqs` (POST):**
    *   Receives `topicName`, `chapterContent` (optional), and `pyqs` (optional) as JSON from the frontend.
    *   Validates that `topicName` is provided.
    *   Calls `generate_mcqs_with_gemini` to get the MCQs.
    *   Returns the generated MCQs as a JSON response (`{"mcqs": mcqs_text}`).
    *   Returns appropriate HTTP error codes (400 for bad request, 500 for server errors).

*   **`/api/export-word` (POST):**
    *   Receives `mcqs` (the text of generated MCQs) and `topicName` as JSON from the frontend.
    *   Calls the Word export logic (see below).
    *   Uses `send_file` to send the generated `.docx` file back to the frontend as an attachment.
    *   The `download_name` for the file is dynamically created based on the `topicName`.

#### 2.3.4. Word Export Logic

*   Implemented within the `/api/export-word` route.
*   **`Document()`:** Creates a new Word document instance using `python-docx`.
*   **Title:** Adds a main heading to the document using `document.add_heading()`, dynamically set based on the `topic_name_for_export`.
*   **Content:** The `mcqs_text` is split by newline characters. Each non-empty line is added as a new paragraph to the document using `document.add_paragraph()`.
*   **File Streaming:** The document is saved to an in-memory binary stream (`io.BytesIO()`) instead of a temporary file on the server. This is efficient for sending the file directly in the HTTP response.
*   **Filename Sanitization:** The `sanitize_filename(name)` helper function cleans the topic name to create a valid and safe filename (replaces spaces, removes invalid characters).

### 2.4. Environment Variables

*   **`backend/.env` file:** (This file is gitignored and should be created manually by the user).
    ```env
    GOOGLE_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
    ```
    This stores the sensitive Google Gemini API key, keeping it separate from the codebase.

---

## 3. Frontend (React - Vite)

The frontend provides the user interface and handles interactions.

### 3.1. Core Dependencies

(As defined in `frontend/package.json`)

*   **`react` & `react-dom`**: Core libraries for building the user interface with React.
*   **`axios`**: A promise-based HTTP client for making API requests to the backend.
*   **`vite`**: The build tool and development server, providing a fast development experience.
*   **`@vitejs/plugin-react`**: Vite plugin for React integration.
*   **ESLint and related plugins**: For code linting and quality.

### 3.2. Directory Structure

```
frontend/
├── .gitignore
├── eslint.config.js
├── index.html          # Main HTML entry point
├── package.json
├── pnpm-lock.yaml
├── vite.config.js      # Vite configuration (includes proxy)
├── public/             # Static assets (not heavily used in this MVP)
└── src/
    ├── App.css         # Styles specific to App.jsx
    ├── App.jsx         # Main React application component
    ├── index.css       # Global styles
    └── main.jsx        # React application entry point
```

### 3.3. Key Files & Components

#### 3.3.1. `index.html`

*   The single HTML page that Vite serves.
*   Contains a `<div id="root"></div>` where the React application is mounted.
*   Includes `<script type="module" src="/src/main.jsx"></script>` to load the React app.
*   The `<title>` is set to "NCERT MCQ Generator".

#### 3.3.2. `src/main.jsx`

*   The entry point for the React application.
*   Imports `React`, `ReactDOM`, the main `App` component, and global `index.css`.
*   Renders the `<App />` component into the `root` div from `index.html` using `ReactDOM.createRoot().render()`.
*   `React.StrictMode` is enabled for development checks.

#### 3.3.3. `src/App.jsx` (Main Application Component)

This is the heart of the frontend.

*   **Function Component:** `function App() { ... }`.
*   **State Management (using `useState` hook):**
    *   `topicName`: Stores the user's input for the MCQ topic.
    *   `chapterContent`: Stores pasted chapter text.
    *   `pyqs`: Stores pasted Previous Year Questions.
    *   `generatedMcqs`: Stores the MCQ text received from the backend. This is also bound to the editable textarea.
    *   `isLoading`: Boolean to manage the loading state (e.g., disable buttons, show loading message) during API calls.
    *   `error`: Stores error messages to display to the user.
*   **Event Handlers:**
    *   `handleGenerateMcqs()`:
        *   Triggered by the "Generate MCQs" button.
        *   Validates that `topicName` is not empty.
        *   Sets `isLoading` to true, clears previous errors and MCQs.
        *   Makes a POST request to `/api/generate-mcqs` using `axios`, sending `topicName`, `chapterContent`, and `pyqs`.
        *   On success, updates `generatedMcqs` state with the response.
        *   On error, updates the `error` state.
        *   Sets `isLoading` to false in a `finally` block.
    *   `handleExportWord()`:
        *   Triggered by the "Export as Word (.docx)" button.
        *   Validates that `generatedMcqs` is not empty.
        *   Makes a POST request to `/api/export-word` using `axios`, sending `generatedMcqs` and `topicName`.
        *   **`responseType: 'blob'`**: Crucial for receiving file data.
        *   Creates a `Blob` from the response data with the correct MIME type for Word documents.
        *   Uses `window.URL.createObjectURL(blob)` to create a temporary URL for the blob.
        *   Creates an `<a>` element, sets its `href` to the blob URL and `download` attribute to a filename (either from `Content-Disposition` header or a fallback).
        *   Programmatically clicks the link to trigger the download.
        *   Cleans up the object URL using `window.URL.revokeObjectURL()`.
        *   Includes error handling for the export process.
*   **JSX Structure:**
    *   Renders a main container (`<div className="container">`).
    *   Includes an `<h1>` title.
    *   Input fields (`<input type="text">` for topic name, `<textarea>` for chapter content and PYQs) are grouped with labels. Their values are bound to the respective state variables, and `onChange` handlers update the state.
    *   "Generate MCQs" button, disabled when `isLoading` or `topicName` is empty.
    *   Conditional rendering for error messages (`{error && ...}`) and loading messages (`{isLoading && ...}`).
    *   Conditional rendering for the output section (`{generatedMcqs && !isLoading && ...}`):
        *   An `<h2>` for "Generated MCQs (Editable)".
        *   A `<textarea className="mcqs-output-area">` where `generatedMcqs` are displayed and can be edited directly (two-way binding via `value` and `onChange`).
        *   "Export as Word (.docx)" button, disabled if `generatedMcqs` is empty.

#### 3.3.4. `src/App.css` & `src/index.css`

*   **`src/index.css`**: Contains very basic global styles, primarily for the `body` (background color, default font). It also includes some default Vite styles which are mostly commented out.
*   **`src/App.css`**: Contains specific styles for the elements within `App.jsx`, such as the main container, input groups, textareas, buttons, and messages. It ensures a clean and consistent look, overriding browser defaults where necessary (e.g., input field background and text colors).

#### 3.3.5. `vite.config.js`

*   Configures Vite for the React project.
*   **Key Configuration: `server.proxy`**:
    ```javascript
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000', // Backend address
          changeOrigin: true,
        }
      }
    }
    ```
    This proxies any requests made from the frontend starting with `/api` to the Flask backend running on `http://127.0.0.1:5000`. This is essential during development to avoid CORS issues, as the frontend (e.g., `localhost:5173`) and backend (`localhost:5000`) run on different ports.

### 3.4. State Management

Simple local component state managed by the `useState` hook within `App.jsx` is sufficient for the MVP's needs. No complex state management libraries (like Redux or Zustand) are used.

### 3.5. API Communication

*   **`axios`** is used for all HTTP requests to the backend.
*   Requests are made to relative paths (e.g., `/api/generate-mcqs`) which are then handled by the Vite proxy during development.
*   JSON is the data format for request and response payloads (except for file downloads, which use `blob`).

---

## 4. Data Flow for MCQ Generation & Export

### MCQ Generation:

1.  **User Input (Frontend):** User types topic name, optionally pastes chapter content and PYQs. This updates React state in `App.jsx`.
2.  **Generate Request (Frontend):** User clicks "Generate MCQs". `handleGenerateMcqs` in `App.jsx` sends a POST request to `/api/generate-mcqs` with the state data.
3.  **API Call (Backend):** Flask route `/api/generate-mcqs` receives the data.
4.  **Gemini Interaction (Backend):** `generate_mcqs_with_gemini` function formats a prompt and sends it to the Gemini API.
5.  **Gemini Response (Backend):** Gemini returns generated MCQ text.
6.  **API Response (Backend):** Flask sends the MCQ text back to the frontend as JSON.
7.  **Display MCQs (Frontend):** `axios` callback in `App.jsx` updates the `generatedMcqs` state, re-rendering the textarea with the new MCQs.

### Word Export:

1.  **User Action (Frontend):** User clicks "Export as Word". `handleExportWord` in `App.jsx` is triggered.
2.  **Export Request (Frontend):** Sends a POST request to `/api/export-word` with the current `generatedMcqs` text and `topicName`. The request specifies `responseType: 'blob'`.
3.  **Document Creation (Backend):** Flask route `/api/export-word` receives the data. It uses `python-docx` to create a Word document in memory, adding the title and MCQs as paragraphs.
4.  **File Streaming (Backend):** The Word document is saved to an `io.BytesIO` stream and sent back in the HTTP response with appropriate `mimetype` and `Content-Disposition` headers (for filename).
5.  **File Download (Frontend):** `axios` callback in `App.jsx` receives the blob. It creates a temporary URL for the blob and triggers a browser download.
