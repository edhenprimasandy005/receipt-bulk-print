'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { X, MagicWand } from 'phosphor-react';
import { autoCropPdf } from '@/utils/pdfAutoCrop';

// Set worker for pdfjs - use dynamic version from installed package
if (typeof window !== 'undefined') {
  // Get version dynamically from the installed package
  const pdfjsVersion = pdfjsLib.version || '4.10.38';
  
  // Use unpkg CDN (more reliable than cdnjs for ES modules)
  // This will work immediately without needing to copy worker files
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
}

interface PdfCropperModalProps {
  pdfFile: File;
  pdfId: string;
  onCropped: (pdfId: string, croppedImageData: string) => void;
  onClose: () => void;
}

export default function PdfCropperModal({
  pdfFile,
  pdfId,
  onCropped,
  onClose,
}: PdfCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const renderTaskRef = useRef<any>(null); // Track render task to cancel if needed
  const isRenderingRef = useRef<boolean>(false); // Flag to prevent multiple renders
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Display size and actual resolution for high-quality printing
  const DISPLAY_SIZE = 430;
  const RESOLUTION_MULTIPLIER = 2;
  const ACTUAL_SIZE = DISPLAY_SIZE * RESOLUTION_MULTIPLIER; // 860x860 pixels

  useEffect(() => {
    // Ensure worker is configured before loading PDF
    const pdfjsVersion = pdfjsLib.version || '4.10.38';
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    }
    
    loadPdf();
    return () => {
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    if (imgRef.current && previewUrl && !cropperRef.current) {
      // Wait for image to load before initializing cropper
      const img = imgRef.current;
      if (img.complete) {
        initializeCropper();
      } else {
        img.onload = () => {
          initializeCropper();
        };
      }
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [previewUrl]);

  const loadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure worker is set before loading PDF (use dynamic version)
      const pdfjsVersion = pdfjsLib.version || '4.10.38';
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
      }
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      
      // More helpful error message
      const errorMsg = error instanceof Error ? error.message : String(error);
      let userMessage = 'Error loading PDF. Please try another file.';
      
      if (errorMsg.includes('worker') || errorMsg.includes('fetch')) {
        const pdfjsVersion = pdfjsLib.version || '4.10.38';
        userMessage = `Error loading PDF worker from CDN. Please check your internet connection and try again. (Version: ${pdfjsVersion})`;
        setError(userMessage);
      } else if (errorMsg.includes('Invalid PDF')) {
        userMessage = 'Invalid PDF file. Please select a valid PDF.';
        setError(userMessage);
      } else {
        setError(userMessage);
      }
      
      // Don't close immediately, let user see the error
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || isRenderingRef.current) return;

    try {
      // Set flag to prevent multiple renders
      isRenderingRef.current = true;
      setIsLoading(true);

      // Cancel and wait for previous render task to complete cancellation
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
          // Wait a bit for cancellation to complete
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }

      // Clear previous preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

      // Destroy existing cropper before rendering new page
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      // Create a NEW off-screen canvas for each render to avoid conflicts
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;

      const context = offscreenCanvas.getContext('2d');
      if (!context) {
        isRenderingRef.current = false;
        return;
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Start render task on the NEW canvas
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      // Wait for render to complete
      await renderTask.promise;
      
      // Clear render task reference after completion
      renderTaskRef.current = null;

      // Convert off-screen canvas to image data URL
      const dataUrl = offscreenCanvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
      setError(null);
      setIsLoading(false);
      isRenderingRef.current = false;
    } catch (error: any) {
      // Ignore cancellation errors
      if (error?.name === 'RenderingCancelledException' || error?.message?.includes('cancelled')) {
        console.log('Previous render was cancelled');
        isRenderingRef.current = false;
        setIsLoading(false);
        return;
      }
      
      // Handle canvas errors specifically
      if (error?.message?.includes('canvas') || error?.message?.includes('render')) {
        console.error('Canvas render error:', error);
        setError('Error rendering PDF page. Please try again or refresh the page.');
      } else {
        console.error('Error rendering page:', error);
        setError('Error rendering PDF page. Please try again.');
      }
      
      setIsLoading(false);
      renderTaskRef.current = null;
      isRenderingRef.current = false;
    }
  };

  const initializeCropper = () => {
    if (!imgRef.current || cropperRef.current) return;

    cropperRef.current = new Cropper(imgRef.current, {
      aspectRatio: 1, // Square aspect ratio (1:1) - will be exported at 860x860 (2x resolution)
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: false, // Don't center the crop box
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      responsive: true,
      ready() {
        setIsLoading(false);
        // Set initial crop box size to display size and position at top-left
        if (cropperRef.current) {
          const containerData = cropperRef.current.getContainerData();
          const minSize = Math.min(containerData.width, containerData.height) * 0.8;
          const cropSize = Math.min(DISPLAY_SIZE, minSize);
          
          // Position at top-left (small offset from edges)
          const offset = 0; // 10px offset from top-left corner
          cropperRef.current.setCropBoxData({
            width: cropSize,
            height: cropSize,
            left: offset,
            top: offset,
          });
        }
      },
    });
  };

  const handleCrop = () => {
    if (!cropperRef.current) return;

    // Crop to 2x resolution (860x860 pixels) for high-quality printing
    const croppedCanvas = cropperRef.current.getCroppedCanvas({
      width: ACTUAL_SIZE, // 860x860 pixels (2x for high-quality print)
      height: ACTUAL_SIZE,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!croppedCanvas) return;

    const croppedDataUrl = croppedCanvas.toDataURL('image/png', 1.0);
    onCropped(pdfId, croppedDataUrl);
  };

  const handleAutoCrop = async () => {
    try {
      setIsLoading(true);
      // Auto-crop PDF from top-left
      const croppedDataUrl = await autoCropPdf(pdfFile, currentPage);
      onCropped(pdfId, croppedDataUrl);
    } catch (error) {
      console.error('Error auto-cropping PDF:', error);
      setError('Error auto-cropping PDF. Please try manual cropping.');
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isRenderingRef.current) {
      // Cancel any ongoing render before changing page
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
      setIsLoading(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !isRenderingRef.current) {
      // Cancel any ongoing render before changing page
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
      setIsLoading(true);
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crop PDF - {pdfFile.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && !previewUrl && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading PDF...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadPdf();
                }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Page Navigation */}
          {totalPages > 1 && !error && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}

          {/* PDF Preview Container */}
          <div className="flex justify-center">
            <div className="max-w-full relative">
              {previewUrl && (
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="PDF Preview"
                  className="max-w-full h-auto"
                  style={{ display: 'block' }}
                />
              )}
              {isLoading && previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden canvas for PDF rendering */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAutoCrop}
            disabled={isLoading || !!error}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MagicWand className="w-5 h-5" weight="bold" />
            Auto Crop
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Skip
            </button>
            <button
              onClick={handleCrop}
              disabled={!cropperRef.current || isLoading || !!error}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crop & Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
