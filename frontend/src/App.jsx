// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf'; // Only jsPDF is needed now for this PDF approach
// No longer need 'jspdf-autotable' for this specific format
import './App.css';

function App() {
  const [topicName, setTopicName] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [pyqs, setPyqs] = useState('');
  const [generatedMcqs, setGeneratedMcqs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMcqs = async () => {
    if (!topicName.trim()) {
      setError('Topic Name is required.');
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedMcqs('');

    try {
      const response = await axios.post('/api/generate-mcqs', {
        topicName,
        chapterContent,
        pyqs,
      });
      setGeneratedMcqs(response.data.mcqs);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate MCQs. Check backend & API key.';
      setError(errorMsg);
      console.error("Error generating MCQs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWord = async () => {
    // ... (Word export logic remains unchanged - keep it as is)
    if (!generatedMcqs.trim()) {
      setError('No MCQs to export. Please generate MCQs first.');
      return;
    }
    setError('');
    try {
      const payload = { mcqs: generatedMcqs, topicName: topicName };
      const response = await axios.post('/api/export-word', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const filename = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `mcqs.docx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      let detailedError = 'Failed to export Word file.';
      if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            const errorText = await err.response.data.text();
            detailedError = JSON.parse(errorText)?.error || errorText;
          } catch { detailedError = 'Failed to read error from Word export response.'; }
        } else if (typeof err.response.data === 'object') {
          detailedError = err.response.data.error || err.response.data.message || 'Failed to export Word file.';
        }
      }
      setError(detailedError);
      console.error(`Error exporting Word document:`, err);
    }
  };

  // Helper function to sanitize filenames on client-side (basic version)
  const sanitize_filename_for_js = (name) => {
    return name.replace(/[^a-z0-9_.-]/gi, '_').replace(/__+/g, '_');
  };

  const handleExportPdf = () => {
    if (!generatedMcqs.trim()) {
      setError('No MCQs to export. Please generate MCQs first.');
      return;
    }
    setError('');

    try {
      const doc = new jsPDF({
        orientation: 'p', // portrait
        unit: 'mm',       // millimeters
        format: 'a4'      // A4 size
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15; // mm
      const lineHeight = 7; // mm, adjust as needed for your font size
      let yPosition = margin; // Start Y position

      // --- Title ---
      const titleText = topicName ? `${topicName} MCQs` : "Generated MCQs";
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold'); // Set font to bold for title
      // Handle title text wrapping
      const splitTitle = doc.splitTextToSize(titleText, pageWidth - margin * 2);
      doc.text(splitTitle, margin, yPosition);
      yPosition += (splitTitle.length * (lineHeight * 0.8)) + lineHeight; // Adjust spacing after title
      doc.setFont(undefined, 'normal'); // Reset font to normal
      doc.setFontSize(11);


      // --- MCQs Content ---
      const lines = generatedMcqs.split('\n');

      const checkAndAddPage = (spaceNeeded) => {
        if (yPosition + spaceNeeded > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      for (const line of lines) {
        if (line.trim() === '') { // Handle empty lines as a paragraph break
          checkAndAddPage(lineHeight * 0.5); // Add a bit of space for a paragraph break
          yPosition += lineHeight * 0.5;
          continue;
        }

        checkAndAddPage(lineHeight); // Check space for the current line

        let xOffset = margin;
        let currentFontWeight = 'normal';

        // Basic styling based on line content
        if (line.match(/^Q\d*\s*\./i)) { // Question line
          currentFontWeight = 'bold';
        } else if (line.match(/^[A-D]\)\s*/i)) { // Option line
          xOffset = margin + 5; // Indent options slightly
        } else if (line.toLowerCase().startsWith('answer:')) {
          currentFontWeight = 'bold';
          // Optionally, color the answer
          // doc.setTextColor(0, 128, 0); // Green color for answer
        }

        doc.setFont(undefined, currentFontWeight);
        const splitLine = doc.splitTextToSize(line, pageWidth - xOffset - margin);

        // If text is split into multiple lines by jsPDF
        for (let i = 0; i < splitLine.length; i++) {
          if (i > 0) { // For subsequent lines of a wrapped text
            checkAndAddPage(lineHeight);
          }
          doc.text(splitLine[i], xOffset, yPosition);
          if (i < splitLine.length - 1) { // If there are more wrapped lines
            yPosition += lineHeight;
          }
        }
        yPosition += lineHeight;

        // Reset text color if it was changed (e.g., for answer)
        // doc.setTextColor(0, 0, 0); // Black
        doc.setFont(undefined, 'normal'); // Reset font style
      }

      const filename = (topicName ? sanitize_filename_for_js(topicName) : 'mcqs') + '.pdf';
      doc.save(filename);

    } catch (e) {
      console.error("Error generating PDF:", e);
      setError(`Failed to generate PDF: ${e.message}. See console for details.`);
    }
  };

  return (
    <div className="container">
      <h1>NCERT MCQ Generator</h1>

      <div className="input-group">
        <label htmlFor="topicName">Topic Name *</label>
        <input
          type="text"
          id="topicName"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g., French Revolution"
        />
      </div>

      <div className="input-group">
        <label htmlFor="chapterContent">Paste Chapter Content (optional):</label>
        <textarea
          id="chapterContent"
          value={chapterContent}
          onChange={(e) => setChapterContent(e.target.value)}
          placeholder="Paste relevant text from the NCERT chapter here..."
        />
      </div>

      <div className="input-group">
        <label htmlFor="pyqs">Paste PYQs (optional):</label>
        <textarea
          id="pyqs"
          value={pyqs}
          onChange={(e) => setPyqs(e.target.value)}
          placeholder="Paste any previous year questions for context..."
        />
      </div>

      <button onClick={handleGenerateMcqs} disabled={isLoading || !topicName.trim()}>
        {isLoading ? 'Generating...' : 'Generate MCQs'}
      </button>

      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Generating MCQs, please wait... This might take a moment.</div>}

      {generatedMcqs && !isLoading && (
        <>
          <h2>Generated MCQs (Editable)</h2>
          <textarea
            className="mcqs-output-area"
            value={generatedMcqs}
            onChange={(e) => setGeneratedMcqs(e.target.value)}
            aria-label="Generated MCQs"
          />
          <div className="export-buttons">
            <button onClick={handleExportWord} disabled={!generatedMcqs.trim()}>
              Export as Word (.docx)
            </button>
            <button onClick={handleExportPdf} disabled={!generatedMcqs.trim()}>
              Export as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;