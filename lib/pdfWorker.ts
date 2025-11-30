/**
 * PDF.js Worker Configuration
 * Handles setting up the PDF.js worker with fallback options
 */

export function setupPdfWorker() {
  if (typeof window === 'undefined') return;

  // Try to use local worker first (from public folder)
  // Fallback to CDN if local worker is not available
  
  const localWorkerMjs = '/pdf.worker.min.mjs';
  const localWorkerJs = '/pdf.worker.min.js';
  
  // Check if local worker exists by trying to fetch it
  fetch(localWorkerMjs, { method: 'HEAD' })
    .then((response) => {
      if (response.ok) {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.pdfjsLib) {
          // @ts-ignore
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerMjs;
        }
      }
    })
    .catch(() => {
      // Try .js version
      fetch(localWorkerJs, { method: 'HEAD' })
        .then((response) => {
          if (response.ok) {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.pdfjsLib) {
              // @ts-ignore
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerJs;
            }
          }
        })
        .catch(() => {
          // Fallback to CDN with proper protocol
          const pdfjsVersion = '4.0.379';
          // @ts-ignore
          if (typeof window !== 'undefined' && window.pdfjsLib) {
            // @ts-ignore
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`;
          }
        });
    });
}

