/**
 * Centralized PDF.js configuration
 *
 * This module sets up the PDF.js worker with optimized Vite bundling.
 * Using local worker import instead of CDN for better performance and offline support.
 */
import { pdfjs } from 'react-pdf';

// Import worker using Vite's ?url suffix for proper bundling
// This tells Vite to return the URL to the worker file
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure global worker source
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Re-export pdfjs for convenience
export { pdfjs };
