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
    *   [3.5. API Communication (Backend)](#35-api-communication-backend)
    *   [3.6. Client-Side PDF Export Logic](#36-client-side-pdf-export-logic)
4.  [Data Flow](#4-data-flow)
    *   [4.1. MCQ Generation](#41-mcq-generation)
    *   [4.2. Word Export](#42-word-export)
    *   [4.3. PDF Export](#43-pdf-export)
5.  [Appendix A: PDF Export Troubleshooting Log (Server-Side - Deprecated)](#appendix-a-pdf-export-troubleshooting-log-server-side---deprecated)

---

## 1. High-Level Architecture

The application follows a client-server architecture:

*   **Frontend (Client):** A Single Page Application (SPA) built with React and Vite. It handles user interaction, collects input, displays generated MCQs, initiates Word export requests to the backend, and **generates PDF documents directly in the browser**.
*   **Backend (Server):** A Python Flask application that serves as an API. It processes requests from the frontend for MCQ generation and handles the creation of Word documents for export.

Communication between frontend and backend for AI generation and Word export is via HTTP requests to defined API endpoints. PDF export is a client-side operation.

---

## 2. Backend (Flask - Python)

The backend is responsible for the core logic of MCQ generation and **server-side file export (Word documents)**.

### 2.1. Core Dependencies

(As defined in `backend/requirements.txt`)

*   **`Flask`**: Micro web framework.
*   **`Flask-CORS`**: Handles Cross-Origin Resource Sharing.
*   **`google-generativeai`**: SDK for Google Gemini API.
*   **`python-docx`**: Used for Word (.docx) document creation.
*   **`python-dotenv`**: Manages environment variables.
*   **`unicodedata`, `re`**: Standard Python libraries for text cleaning.

### 2.2. Directory Structure

```
backend/
├── app.py           # Main Flask application file
├── requirements.txt # Python dependencies
└── .env             # (Gitignored) Stores the Google API key
```
*(A `venv/` directory for the virtual environment is typically present but gitignored).*

### 2.3. Key File: `app.py`

#### 2.3.1. Initialization & Configuration
*(No changes from your existing `technical_overview.md` here)*

#### 2.3.2. Gemini AI Integration
*(No changes from your existing `technical_overview.md` here)*

#### 2.3.3. API Endpoints
*   **`/api/generate-mcqs` (POST):** (No changes)
*   **`/api/export-word` (POST):** (No changes)
    *   *(The PDF export endpoint has been removed from the backend).*

#### 2.3.4. Word Export Logic
*(No changes from your existing `technical_overview.md` here)*

### 2.4. Environment Variables
*(No changes from your existing `technical_overview.md` here)*

---

## 3. Frontend (React - Vite)

The frontend provides the user interface, handles interactions, and **now manages client-side PDF generation**.

### 3.1. Core Dependencies

(As defined in `frontend/package.json`)

*   **`react` & `react-dom`**: Core React libraries.
*   **`axios`**: HTTP client for backend API requests.
*   **`jspdf`**: JavaScript library for client-side PDF generation. *(Note: `jspdf-autotable` was considered but not used for the final line-by-line PDF format).*
*   **`vite`**: Build tool and development server.
*   **`@vitejs/plugin-react`**: Vite plugin for React.
*   **ESLint and related plugins**: For code linting.

### 3.2. Directory Structure
*(No changes from your existing `technical_overview.md` here)*

### 3.3. Key Files & Components

#### 3.3.1. `index.html`
*(No changes from your existing `technical_overview.md` here)*

#### 3.3.2. `src/main.jsx`
*(No changes from your existing `technical_overview.md` here)*

#### 3.3.3. `src/App.jsx` (Main Application Component)

This component handles all primary user interactions and state.

*   **Function Component & State Management:** *(Largely the same, `generatedMcqs` remains a string)*
*   **Event Handlers:**
    *   `handleGenerateMcqs()`: *(No changes)*
    *   `handleExportWord()`: *(No changes)*
    *   **`handleExportPdf()` (New/Revised):**
        *   Triggered by the "Export as PDF" button.
        *   Validates that `generatedMcqs` (the raw string output from Gemini) is not empty.
        *   Initializes a `new jsPDF()` instance with A4 portrait settings.
        *   Defines page layout variables (margins, line height, current Y position).
        *   **Title Generation:** Writes the topic name (or a default title) at the top of the PDF, handling text wrapping using `doc.splitTextToSize()`.
        *   **MCQ Parsing & Rendering:**
            *   Iterates through each line of the `generatedMcqs` string.
            *   Implements a `checkAndAddPage()` helper to manage page breaks if content exceeds page height.
            *   Applies basic styling (bolding for questions/answers, indentation for options) using `doc.setFont()` and adjusting `xOffset`.
            *   Uses `doc.splitTextToSize()` for each line to handle automatic text wrapping within the defined page width and margins.
            *   Writes the (potentially wrapped) lines to the PDF using `doc.text()`, advancing the `yPosition` accordingly.
        *   Generates a sanitized filename using a helper function (`sanitize_filename_for_js`).
        *   Calls `doc.save(filename)` to trigger the browser download of the PDF.
        *   Includes `try...catch` for error handling during PDF generation.

*   **JSX Structure:**
    *   *(Input fields and MCQ generation section remain the same)*
    *   **Export Buttons:** Now includes both "Export as Word (.docx)" and "Export as PDF" buttons, each linked to their respective handler functions.

#### 3.3.4. `src/App.css` & `src/index.css`
*(No changes from your existing `technical_overview.md` here)*

#### 3.3.5. `vite.config.js`
*(No changes from your existing `technical_overview.md` here)*

### 3.4. State Management
*(No changes from your existing `technical_overview.md` here)*

### 3.5. API Communication (Backend)
*(No changes from your existing `technical_overview.md` here)*

### 3.6. Client-Side PDF Export Logic

*   **Library:** `jspdf` is used directly.
*   **Process:**
    1.  The `generatedMcqs` string (raw text from Gemini) is split into lines.
    2.  A new `jsPDF` document is created.
    3.  A title is rendered at the top, with text wrapping.
    4.  Each line of the MCQ text is processed sequentially:
        *   Page breaks are handled automatically by checking available space.
        *   Basic styling (bold for questions/answers, indent for options) is applied.
        *   `jsPDF`'s `splitTextToSize` and `text` methods are used to render text with wrapping.
    5.  The `doc.save()` method initiates the download in the user's browser.
*   **Formatting Goal:** To create a PDF that visually resembles a standard document, with questions, options, and answers flowing line by line, similar to the Word export, rather than a tabular format.
*   **Font:** Uses `jsPDF`'s default built-in fonts.

---

## 4. Data Flow

### 4.1. MCQ Generation
*(No changes from your existing `technical_overview.md` here)*

### 4.2. Word Export
*(No changes from your existing `technical_overview.md` here)*

### 4.3. PDF Export

1.  **User Action (Frontend):** User clicks "Export as PDF". `handleExportPdf` in `App.jsx` is triggered.
2.  **Data Preparation (Frontend):** The current `generatedMcqs` string (edited or as-is from Gemini) is used as the source. The `topicName` is also used for the title and filename.
3.  **PDF Document Creation (Frontend - Client-Side):**
    *   A `jsPDF` instance is created.
    *   The title is added.
    *   The `generatedMcqs` string is iterated line by line. Each line is written to the PDF, with `jsPDF` handling text wrapping and page breaks managed by custom logic (`checkAndAddPage`). Basic styling (bolding, indentation) is applied.
4.  **File Download (Frontend):** `jsPDF`'s `doc.save()` method prompts the browser to download the generated PDF directly. No backend interaction is involved in this step.

---
## Appendix A: PDF Export Troubleshooting Log (Server-Side - Deprecated)

*(This section, detailing the `fpdf2` issues, can remain as is for historical context and lessons learned.)*
*(You provided this content in the previous message, so ensure it's correctly appended here if you have it in a separate file or as part of the main technical_overview.md)*