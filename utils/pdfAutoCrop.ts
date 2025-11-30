import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is configured
if (typeof window !== 'undefined') {
  const pdfjsVersion = pdfjsLib.version || '4.10.38';
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
  }
}

const CROP_SIZE = 430; // 430x430 pixels

/**
 * Automatically crops a PDF file from top-left corner
 * @param pdfFile - The PDF file to crop
 * @param pageNumber - Page number to crop (default: 1)
 * @returns Promise<string> - Data URL of the cropped image
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

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = CROP_SIZE;
    croppedCanvas.height = CROP_SIZE;
    const croppedContext = croppedCanvas.getContext('2d');

    if (!croppedContext) {
      throw new Error('Failed to get cropped canvas context');
    }

    // Crop from top-left corner (0, 0)
    // The canvas is rendered at scale 2.0, so we need to crop a square region
    // that represents 430x430 pixels at the original scale
    // Since we're using scale 2.0, the actual crop size on canvas is 430 * 2 = 860
    const sourceX = 0;
    const sourceY = 0;
    
    // Calculate the crop size on the rendered canvas (accounting for scale)
    // We want 430px at original size, but canvas is at 2x scale
    const cropSizeOnCanvas = CROP_SIZE * 2; // 860 pixels
    
    // Use the smaller dimension to ensure we don't go out of bounds
    const maxCropSize = Math.min(viewport.width, viewport.height);
    const actualCropSize = Math.min(cropSizeOnCanvas, maxCropSize);
    
    // Draw the cropped portion to the new canvas with high quality scaling
    croppedContext.imageSmoothingEnabled = true;
    croppedContext.imageSmoothingQuality = 'high';
    
    croppedContext.drawImage(
      canvas,
      sourceX,           // Source x (top-left)
      sourceY,           // Source y (top-left)
      actualCropSize,    // Source width (on scaled canvas)
      actualCropSize,    // Source height (on scaled canvas)
      0,                 // Destination x
      0,                 // Destination y
      CROP_SIZE,         // Destination width (430px)
      CROP_SIZE          // Destination height (430px)
    );

    // Convert to data URL
    const croppedDataUrl = croppedCanvas.toDataURL('image/png');
    
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

