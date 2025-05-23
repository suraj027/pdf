
import React from 'react';
import ReactDOM from 'react-dom/client';
import Shell from './Shell'; // Import the Shell component
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Setup PDF.js worker
try {
  // Ensure pdfjsLib and necessary properties are loaded before use.
  // The import 'import * as pdfjsLib from "pdfjs-dist/build/pdf";' itself would likely throw
  // an error and lead to a blank page if pdfjs-dist fails to load from esm.sh (e.g., network issue).
  // These checks are for robustness if pdfjsLib is loaded but might be incomplete or malformed.
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    if (typeof pdfjsLib.version === 'string' && pdfjsLib.version.length > 0) {
      const PDF_JS_VERSION = pdfjsLib.version;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.js`;
    } else {
      console.error(
        'PDF.js library (pdfjsLib.version) is not a valid string. PDF functionality will be impaired. ' +
        'Attempting to use a default/latest worker path from esm.sh, but this may not match the loaded library version.'
      );
      // Fallback to a common version or a generic path if version is unknown. This is a guess.
      // Using a fixed recent version as a fallback.
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.2.133/build/pdf.worker.js`;
    }
  } else {
    console.error(
      'PDF.js library (pdfjsLib) or pdfjsLib.GlobalWorkerOptions is missing. ' +
      'This might be due to an issue with how "pdfjs-dist" was loaded from esm.sh. ' +
      'PDF functionality will be severely impaired or non-functional.'
    );
    // At this point, PDF processing is unlikely to work.
    // The application might still attempt to render, but PDF features will fail.
  }
} catch (e) {
  console.error("Critical error during PDF.js worker initialization phase:", e);
  // A blank page often means an error here (or earlier, like the import itself) was fatal.
  // Re-throwing might be appropriate if the app cannot function at all without PDF.js fully initialized.
  // However, to understand other potential issues, we'll let it proceed if the catch is hit.
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>
);
