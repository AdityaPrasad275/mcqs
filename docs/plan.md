# Project Plan & Progress Tracking

This document outlines the current status of the NCERT MCQ Generator MVP and details the planned features for future iterations.

## Current MVP (Version 1.0)

**Status:** Complete and functional.

**Features Implemented:**
*   **MCQ Generation:** Users can input a topic name, optional chapter content, and optional PYQs. The backend leverages the `gemini-2.0-flash` model to generate 5 MCQs.
*   **Interactive Display:** Generated MCQs are displayed in an editable text area on the frontend, allowing for quick review and modifications.
*   **Word Document Export:** Users can download the generated and/or edited MCQs as a `.docx` file. The document includes a dynamic title based on the input topic, and the filename is also dynamic. This is handled **server-side** by the Flask backend using `python-docx`.
*   **PDF Document Export:** Users can download the generated and/or edited MCQs as a `.pdf` file with a document-like structure (questions, options, answers formatted line by line). This is handled **client-side** in the React application using `jspdf`.
*   **User-Friendly Interface:** Basic clean UI with clear input fields, generation button, and export options.
*   **Technology Stack:**
    *   **Frontend:** React with Vite, `pnpm`.
        *   Client-side PDF Generation: `jspdf`.
    *   **Backend:** Flask (Python).
    *   **AI:** Google Gemini (`gemini-2.0-flash`).
    *   **Server-Side Export:** `python-docx` (for Word).

## Next Steps (Version 1.1 - UI & Enhanced Input)

**Goal:** Improve user experience through design enhancements and introduce more versatile content input methods.

### Planned Features:

1.  **Frontend Design Refinements:**
    *   **Objective:** Make the application more visually appealing and intuitive.
    *   **Details:** (To be defined, e.g., improved layout, color scheme adjustments, cleaner forms, responsive design elements, better visual hierarchy for PDF/Word content preview if feasible).
    *   **Priority:** High.

2.  **Advanced Chapter Material Input (Multimodal Gemini Integration):**
    *   **Objective:** Allow users to provide chapter content through various formats beyond simple text.
    *   **Strategy:** Leverage Gemini's multimodal capabilities. Instead of client-side PDF/image parsing, pass the raw file data (or relevant parts) directly to the Gemini API. Gemini can then "read" the content from these formats.
    *   **Details:**
        *   **PDF Upload for Content Input:** Add a file input for PDF documents. Frontend sends the PDF content (e.g., as base64 string or binary data) to the backend. Backend includes this in the Gemini prompt for content analysis.
        *   **Image Upload for Content Input (OCR/Content Recognition):** Add a file input for image files (e.g., PNG, JPEG of book pages). Frontend sends image data. Backend includes this in the Gemini prompt.
    *   **AI Challenge:** Gemini's ability to extract specific text and context from large or complex PDFs/images needs testing. The prompt engineering will be crucial here.
    *   **Priority:** High.

3.  **"Deep Research" / Web Browsing for Content:**
    *   **Objective:** Allow Gemini to pull information from the internet for MCQ generation, similar to Perplexity.
    *   **Strategy:** Investigate Gemini's "tool use" capabilities or integrate with a web-scraping/search API if direct browser access isn't feasible or robust enough via Gemini's native features.
    *   **Details:**
        *   Option for the user to indicate "research needed" or "generate from internet" if chapter content is scarce.
        *   Backend passes this instruction to Gemini, potentially enabling its web-browsing capabilities.
    *   **Priority:** Medium (complex, might be a stretch for 1.1, could move to 1.2).

## Future Enhancements (Beyond 1.1)

*   **PDF Export Enhancements:**
    *   **Improved Styling & Formatting:** Further refine the client-side PDF generation for more sophisticated layouts, font choices (embedding custom fonts with `jspdf` if needed), and styling options.
    *   **Table-based PDF Option:** Consider re-introducing an option for a table-based PDF layout (using `jspdf-autotable` or similar) if users desire a more condensed, tabular view of MCQs.
*   **User Accounts/History:** Save generated MCQs and user preferences.
*   **Difficulty Levels:** Allow users to specify MCQ difficulty.
*   **Question Type Variety:** Generate true/false, fill-in-the-blanks, etc.
*   **MCQ Validation/Quality Score:** Automated checks for question clarity, answer uniqueness, etc.
*   **Enhanced Editing Tools:** Rich text editor for MCQs, drag-and-drop ordering, etc.