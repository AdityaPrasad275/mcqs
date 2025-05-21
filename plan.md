

## 1. **Core Problem to Solve**

- **Current Pain:** Copying MCQs from ChatGPT to Word messes up formatting.
- **Goal:** One website where your mom can generate, view, and export MCQs for NCERT topics, with clean formatting.

---

## 2. **MVP Features**

### a. **Input**
- **Topic Input:**  
  - Enter topic name (e.g., “French Revolution”, “Resources and Development”)
  - Option to upload NCERT chapter PDF (optional for future)
  - Option to type in text or paste content from a chapter (for now, keep it simple: just a text box)
- **PYQ Input:**  
  - For now, allow manual typing or pasting of previous year questions (PYQs)
  - (Photo upload/OCR can be added later)

### b. **MCQ Generation**
- Use AI to generate MCQs based on the input topic or pasted content.
- Display the MCQs in a clean, easy-to-read format.

### c. **Export**
- Button to export the MCQs as:
  - **Word Document (.docx)**
  - **PDF**

### d. **Editing (Optional for MVP)**
- Allow your mom to edit the MCQs before exporting (even a simple text area for now).

---

## 3. **User Flow**

1. **Homepage:**  
   “Welcome! Generate MCQs for any NCERT topic.”
2. **Input Section:**  
   - Enter topic name  
   - Paste text from book/chapter (optional)
   - Paste/type PYQs (optional)
3. **Generate Button:**  
   - Click to generate MCQs
4. **Review & Edit:**  
   - See generated MCQs  
   - Edit if needed
5. **Export:**  
   - Click to download as Word or PDF

---

## 4. **Tech Stack Suggestions**

- **Frontend:** React (for a fast, simple web app)
- **Backend:** Node.js or Python (Flask/FastAPI) to handle AI calls and file exports
- **AI:** google's gemini (for generating MCQs)
- **Export:**  
  - [docx.js](https://github.com/dolanmiu/docx) or [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) for Word/PDF export
  - [jsPDF](https://github.com/parallax/jsPDF) for PDF export


## 5. **Sample UI Sketch**

```
-------------------------------------------------
| Generate MCQs for NCERT Social Science Topics  |
-------------------------------------------------
| Topic Name: [__________________________]      |
| Paste Chapter Content (optional):             |
| [_______________________________________]     |
| Paste PYQs (optional):                       |
| [_______________________________________]     |
|                                               |
| [Generate MCQs]                               |
-------------------------------------------------
| [MCQs appear here, editable]                  |
|                                               |
| [Export as Word]  [Export as PDF]             |
-------------------------------------------------
```
