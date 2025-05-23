
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

const PDF_PROCESSING_TIMEOUT = 30000; // 30 seconds

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);

  try {
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise((_resolve, reject) => 
        setTimeout(() => reject(new Error('PDF processing timed out after 30 seconds.')), PDF_PROCESSING_TIMEOUT)
      )
    ]) as pdfjsLib.PDFDocumentProxy;

    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await Promise.race([
        page.getTextContent(),
        new Promise((_resolve, reject) => 
          setTimeout(() => reject(new Error(`Timeout extracting text from page ${i}.`)), 10000) // 10s per page
        )
      ]) as pdfjsLib.TextContent;

      // Process items, ensuring they are TextItems and have 'str' property
      fullText += textContent.items
        .filter((item): item is pdfjsLib.TextItem => typeof (item as pdfjsLib.TextItem).str === 'string')
        .map((item: pdfjsLib.TextItem) => item.str)
        .join(' ') + '\n';
    }
    return fullText;
  } catch (error) {
    // Attempt to clean up the loading task on error/timeout
    // Note: destroy() might be called on an already settled/destroyed task, 
    // pdf.js should ideally handle this gracefully.
    if (loadingTask && typeof loadingTask.destroy === 'function') {
        try {
            loadingTask.destroy();
        } catch (destroyError) {
            console.warn("Error while trying to destroy PDF loading task:", destroyError);
        }
    }
    console.error("Error during PDF text extraction:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error (e.g., timeout error)
    }
    throw new Error('Failed to extract text from PDF.'); // Generic fallback
  }
};
