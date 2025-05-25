## Appendix A: PDF Export Troubleshooting Log (MVP Iteration - Deprecated)

**Context:** During the initial MVP development, a feature for exporting MCQs as PDF documents was planned and attempted. This section documents the challenges encountered, the errors faced, and the troubleshooting steps taken. Ultimately, for the sake of a stable MVP, the PDF export feature was deferred.

### 1. Initial Goal & Approach

*   **Goal:** Allow users to download generated MCQs as a `.pdf` file, similar to the Word export functionality.
*   **Initial Library Choice:** `fpdf2` (a Python library for PDF generation). This was chosen for its apparent simplicity and pure Python nature, avoiding heavier dependencies like browser engines if possible.

### 2. The Primary Error Encountered

Across multiple attempts and refinements, the persistent and primary error was:
```
fpdf.errors.FPDFException: Not enough horizontal space to render a single character
```


This error occurred within the `fpdf2` library, specifically during the `pdf.multi_cell()` call (or internal line-breaking logic) when trying to write text content to the PDF.

### 3. Symptoms and Behavior

*   **Inconsistency (Initially Thought):** At first, it seemed like some specific characters might be the cause, as the error would sometimes appear after minor changes to the input text being passed from the Gemini AI.
*   **Persistence Despite Cleaning:** The error continued even after implementing various text cleaning and sanitization techniques (detailed below).
*   **Failure on Simple Strings:** Crucially, the error eventually manifested even with extremely simple, clean ASCII strings like `"A) Economic hardship"`, as confirmed by debug print statements showing the exact string being passed to `fpdf2`. This indicated the problem was likely deeper than just problematic Unicode characters.

### 4. Troubleshooting Steps and Attempts

#### Attempt 1: Basic Text Encoding (Latin-1)

*   **Hypothesis:** The Gemini API might be generating Unicode characters (e.g., smart quotes, em-dashes) that the default `fpdf2` font (Arial, typically Latin-1) couldn't handle.
*   **Action:**
    *   Encoded the text to `latin-1` with `errors='ignore'` or `errors='replace'` before passing it to `fpdf2`'s `multi_cell`.
    *   `clean_line = line.encode('latin-1', 'ignore').decode('latin-1')`
*   **Result:** The error persisted. While this might have caught some characters, it wasn't the root cause.

#### Attempt 2: Unicode Normalization and More Aggressive ASCII Conversion

*   **Hypothesis:** More complex Unicode characters or invisible/non-printable characters might still be slipping through.
*   **Action:**
    *   Used the `unicodedata` library for normalization (`NFKD`) followed by ASCII encoding with `ignore`.
    *   `clean_line = unicodedata.normalize('NFKD', line).encode('ascii', 'ignore').decode('utf-8')`
    *   Added a step to remove non-printable characters: `clean_line = ''.join(char for char in clean_line if char.isprintable() or char.isspace())`
*   **Result:** The `FPDFException` continued, even with very clean-looking strings in the debug output.

#### Attempt 3: Embedding a Unicode-Compatible Font (DejaVuSans)

*   **Hypothesis:** The default `fpdf2` fonts have limited Unicode coverage. Embedding a font with broader Unicode support (like DejaVuSans) should solve character rendering issues.
*   **Action:**
    *   Downloaded `DejaVuSans.ttf` and `DejaVuSans-Bold.ttf`.
    *   Placed them in the `backend/` directory.
    *   Used `pdf.add_font('DejaVuSans', '', 'DejaVuSans.ttf', uni=True)` to register the font with `fpdf2`.
    *   Changed `pdf.set_font()` calls to use `"DejaVuSans"`.
    *   Continued to use text cleaning as a best practice.
*   **Result:** The `FPDFException: Not enough horizontal space...` **still occurred**. This was a strong indicator that the issue might not be solely character-related but could involve `fpdf2`'s font metric calculations or an issue with how it was loading/interpreting the embedded font in the specific environment. Debug logs confirmed the font loading call itself was not raising an immediate "file not found" error (after adding a try-except for it).

#### Attempt 4: Most Aggressive Regex-Based Cleaning + Debugging

*   **Hypothesis:** Perhaps an extremely obscure character or a combination of factors was still at play.
*   **Action:**
    *   Implemented a very strict regex to allow only basic alphanumeric characters, common punctuation, and spaces: `re.sub(r'[^\w\s.,!?;:"\'()\[\]{}&%$#@*+-/=<>]', '', ascii_text)`
    *   Added extensive `print()` statements to see the *exact* string being passed to `pdf.multi_cell()` just before the potential error.
*   **Result:** The error persisted. The debug output showed `fpdf2` failing on perfectly normal, simple ASCII strings like `"A) Economic hardship"`. This effectively ruled out "exotic" characters as the sole or primary cause with the embedded font.

### 5. Conclusion of `fpdf2` Troubleshooting

Given that the `FPDFException` persisted even with:
1.  An embedded Unicode font (`DejaVuSans`).
2.  Aggressively cleaned, simple ASCII strings.

The likely causes shifted towards:
*   A potential issue with the `fpdf2` library's installation or version in the specific development environment.
*   An unresolvable conflict or bug within `fpdf2`'s internal text measurement or line-breaking algorithms when interacting with the system or the embedded font, despite the font being valid.
*   The effort required to further debug `fpdf2`'s internals was deemed too high for an MVP.

**Decision:** The PDF export feature using `fpdf2` was deferred to prioritize a stable MVP focusing on Word export.

### 6. Alternative Considered: `WeasyPrint`

*   **Suggestion:** As a more robust, "tried and tested" alternative, `WeasyPrint` (which uses an HTML/CSS to PDF rendering engine) was proposed.
*   **Implementation Attempt:** Code was drafted to convert the MCQ text to HTML and then use `WeasyPrint` to generate the PDF.
*   **Challenge:** `WeasyPrint` has significant system-level dependencies (GTK3, Pango, Cairo, etc.) that need to be installed correctly on the host OS, which can add complexity to setup and deployment, especially across different operating systems.
*   **Decision (for MVP):** Due to the added setup complexity of `WeasyPrint`'s dependencies and the desire to simplify the MVP, this approach was also deferred.

**Path Forward (Post-MVP):** If PDF export is revisited, `WeasyPrint` remains a strong candidate, but careful attention must be paid to its installation prerequisites and ensuring a consistent environment. Other client-side JavaScript PDF generation libraries could also be evaluated if server-side generation proves consistently problematic.