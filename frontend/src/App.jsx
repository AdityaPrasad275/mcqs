// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
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
      const errorMsg = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Failed to generate MCQs. Check if the backend is running and the API key is valid.';
      setError(errorMsg);
      console.error("Error generating MCQs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified handleExport to only export Word
  const handleExportWord = async () => {
    if (!generatedMcqs.trim()) {
      setError('No MCQs to export. Please generate MCQs first.');
      return;
    }
    setError('');
    try {
      const payload = {
        mcqs: generatedMcqs,
        topicName: topicName,
      };
      const response = await axios.post(
        '/api/export-word', // Always target the word export endpoint
        payload,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
        : `mcqs.docx`; // Fallback for filename

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

    } catch (err) {
      let detailedError = 'Failed to export file.';
      if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            const errorText = await err.response.data.text();
            try {
              const jsonError = JSON.parse(errorText);
              detailedError = jsonError.error || jsonError.message || errorText;
            } catch (e) {
              detailedError = errorText;
            }
          } catch (blobError) {
            console.error("Could not read error blob as text:", blobError);
          }
        } else if (typeof err.response.data === 'object') {
          detailedError = err.response.data.error || err.response.data.message || 'Failed to export file.';
        }
      }
      setError(detailedError);
      console.error(`Error exporting Word document:`, err);
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
            {/* Removed PDF Export Button */}
          </div>
        </>
      )}
    </div>
  );
}

export default App;