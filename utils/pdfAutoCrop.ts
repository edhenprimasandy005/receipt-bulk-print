import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is configured
if (typeof window !== 'undefined') {
  const pdfjsVersion = pdfjsLib.version || '4.10.38';
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
  }
}

const DISPLAY_SIZE = 430; // Display size in pixels
const RESOLUTION_MULTIPLIER = 2; // 2x for high-quality printing
const ACTUAL_SIZE = DISPLAY_SIZE * RESOLUTION_MULTIPLIER; // 860x860 pixels

/**
 * Automatically crops a PDF file from top-left corner
 * @param pdfFile - The PDF file to crop
 * @param pageNumber - Page number to crop (default: 1)
 * @returns Promise<string> - Data URL of the cropped image at 2x resolution (860x860)
 */
export async function autoCropPdf(
  pdfFile: File,
  pageNumber: number = 1
): Promise<string> {
  try {
    // Ensure worker is configured
    const pdfjsVersion = pdfjsLib.version || '4.10.38';
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    }

    // Load PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;

    // Get the specified page
    if (pageNumber > pdf.numPages) {
      throw new Error(`Page ${pageNumber} does not exist. PDF has ${pdf.numPages} pages.`);
    }

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create off-screen canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Create a new canvas for the cropped image at 2x resolution (860x860)
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = ACTUAL_SIZE;  // 860 pixels
    croppedCanvas.height = ACTUAL_SIZE; // 860 pixels
    const croppedContext = croppedCanvas.getContext('2d');

    if (!croppedContext) {
      throw new Error('Failed to get cropped canvas context');
    }

    // Crop from top-left corner (0, 0)
    // The canvas is rendered at scale 2.0, so we crop 860x860 pixels directly
    const sourceX = 0;
    const sourceY = 0;
    
    // Use the smaller dimension to ensure we don't go out of bounds
    const maxCropSize = Math.min(viewport.width, viewport.height);
    const actualCropSize = Math.min(ACTUAL_SIZE, maxCropSize);
    
    // Draw the cropped portion to the new canvas - no downscaling, keeping full 860x860 resolution
    croppedContext.imageSmoothingEnabled = true;
    croppedContext.imageSmoothingQuality = 'high';
    
    croppedContext.drawImage(
      canvas,
      sourceX,           // Source x (top-left)
      sourceY,           // Source y (top-left)
      actualCropSize,    // Source width (860px from scaled canvas)
      actualCropSize,    // Source height (860px from scaled canvas)
      0,                 // Destination x
      0,                 // Destination y
      ACTUAL_SIZE,       // Destination width (860px - keep full resolution)
      ACTUAL_SIZE        // Destination height (860px - keep full resolution)
    );

    // Convert to data URL with high quality
    const croppedDataUrl = croppedCanvas.toDataURL('image/png', 1.0);
    
    // Clean up
    canvas.width = 0;
    canvas.height = 0;
    croppedCanvas.width = 0;
    croppedCanvas.height = 0;

    return croppedDataUrl;
  } catch (error) {
    console.error('Error auto-cropping PDF:', error);
    throw error;
  }
}

