'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';
import FileUploader from '@/components/FileUploader';
import PrintPreviewA4 from '@/components/PrintPreviewA4';
import PrintableContent from '@/components/PrintableContent';
import FileList from '@/components/FileList';
import PdfCropperModal from '@/components/PdfCropperModal';
import PdfCropChoiceModal from '@/components/PdfCropChoiceModal';
import AutoCropProgressModal from '@/components/AutoCropProgressModal';
import ThemeToggle from '@/components/ThemeToggle';
import { ProcessedImage } from '@/types';
import { Printer, Trash } from 'phosphor-react';

export default function Home() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [imagesPerPage, setImagesPerPage] = useState<1 | 2 | 3 | 4 | 6 | 8 | 9 | 12 | 15 | 16>(4);
  const printRef = useRef<HTMLDivElement>(null);
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    pdfFile: File | null;
    pdfId: string | null;
  }>({
    isOpen: false,
    pdfFile: null,
    pdfId: null,
  });
  const [choiceModal, setChoiceModal] = useState<{
    isOpen: boolean;
    pdfFiles: ProcessedImage[];
  }>({
    isOpen: false,
    pdfFiles: [],
  });
  const [autoCropProgress, setAutoCropProgress] = useState<{
    isOpen: boolean;
    pdfFiles: ProcessedImage[];
  }>({
    isOpen: false,
    pdfFiles: [],
  });
  const [manualCropMode, setManualCropMode] = useState(false);

  const printableImages = images.filter((img) => img.preview);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Receipt Bulk Print',
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  });

  const handleFilesSelected = async (files: File[]) => {
    const newImages: ProcessedImage[] = [];
    const baseTimestamp = Date.now();

    files.forEach((file, index) => {
      // Generate unique ID with timestamp, index, and random number
      const id = `${baseTimestamp}-${index}-${Math.random().toString(36).substring(2, 11)}`;
      const isPdf = file.type === 'application/pdf';

      if (isPdf) {
        // For PDF, we'll show cropper modal first
        // Store it temporarily with a placeholder preview
        newImages.push({
          id,
          file,
          preview: '', // Will be set after cropping
          isPdf: true,
        });
      } else {
        // For images, we'll process them asynchronously
        newImages.push({
          id,
          file,
          preview: '',
          isPdf: false,
        });
      }
    });

    // Process images asynchronously and create previews
    const processedImages = await Promise.all(
      newImages.map(async (img) => {
        if (!img.isPdf && !img.preview) {
          const preview = await fileToDataURL(img.file);
          return { ...img, preview };
        }
        return img;
      })
    );

    // Add all processed images to state
    setImages((prev) => {
      const updated = [...prev, ...processedImages];
      
      // Check if there are any PDFs that need cropping
      const pdfsToCrop = updated.filter((img) => img.isPdf && !img.preview);
      
      // If there are PDFs, show choice modal
      if (pdfsToCrop.length > 0 && !choiceModal.isOpen && !autoCropProgress.isOpen) {
        setTimeout(() => {
          setChoiceModal({
            isOpen: true,
            pdfFiles: pdfsToCrop,
          });
        }, 100);
      }
      
      return updated;
    });
  };

  // Auto-open cropper modal for first uncropped PDF (only after manual crop is chosen)
  useEffect(() => {
    // Only open manual cropper if:
    // 1. Choice modal is closed (user has made a choice)
    // 2. Progress modal is closed (not auto-cropping)
    // 3. Cropper modal is not already open
    // 4. User chose manual crop mode
    if (
      !cropperModal.isOpen &&
      !choiceModal.isOpen &&
      !autoCropProgress.isOpen &&
      manualCropMode
    ) {
      const firstUncroppedPdf = images.find((img) => img.isPdf && !img.preview);
      if (firstUncroppedPdf) {
        setCropperModal({
          isOpen: true,
          pdfFile: firstUncroppedPdf.file,
          pdfId: firstUncroppedPdf.id,
        });
      }
    }
  }, [images, cropperModal.isOpen, choiceModal.isOpen, autoCropProgress.isOpen, manualCropMode]);

  const handleAutoCropAll = () => {
    setChoiceModal({ isOpen: false, pdfFiles: [] });
    setManualCropMode(false);
    setAutoCropProgress({
      isOpen: true,
      pdfFiles: choiceModal.pdfFiles,
    });
  };

  const handleManualCrop = () => {
    setChoiceModal({ isOpen: false, pdfFiles: [] });
    setManualCropMode(true);
    // The useEffect will automatically open the first PDF cropper modal
  };

  const handleAutoCropComplete = (results: Array<{ id: string; preview: string }>) => {
    // Update all cropped PDFs
    setImages((prev) =>
      prev.map((img) => {
        const result = results.find((r) => r.id === img.id);
        if (result) {
          return { ...img, preview: result.preview, isPdf: false };
        }
        return img;
      })
    );
    
    setAutoCropProgress({ isOpen: false, pdfFiles: [] });
    setManualCropMode(false);
  };

  const handlePdfCropped = async (pdfId: string, croppedImageData: string) => {
    // Update the cropped PDF with preview and mark as not PDF anymore
    setImages((prev) =>
      prev.map((img) =>
        img.id === pdfId ? { ...img, preview: croppedImageData, isPdf: false } : img
      )
    );
    
    // Close current modal - useEffect will automatically open next PDF modal
    setCropperModal({ isOpen: false, pdfFile: null, pdfId: null });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
    setCropperModal({ isOpen: false, pdfFile: null, pdfId: null });
  };

  const onPrintClick = () => {
    if (printableImages.length === 0) {
      alert('No images to print');
      return;
    }
    handlePrint();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 no-print">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Receipt Bulk Print Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Receipt Bulk Print
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <FileUploader onFilesSelected={handleFilesSelected} />
            <FileList images={images} onRemove={handleRemoveImage} />
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images per Page
              </label>
              <select
                value={imagesPerPage}
                onChange={(e) =>
                  setImagesPerPage(Number(e.target.value) as 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12 | 15 | 16)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>1 image</option>
                <option value={2}>2 images (2×1)</option>
                <option value={3}>3 images (3×1)</option>
                <option value={4}>4 images (2×2)</option>
                <option value={6}>6 images (2×3)</option>
                <option value={8}>8 images (2×4)</option>
                <option value={9}>9 images (3×3)</option>
                <option value={12}>12 images (4×3)</option>
                <option value={15}>15 images (5×3)</option>
                <option value={16}>16 images (4×4)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onPrintClick}
                disabled={printableImages.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" weight="bold" />
                Print
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash className="w-5 h-5" weight="bold" />
                Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <PrintPreviewA4
              images={printableImages}
              imagesPerPage={imagesPerPage}
            />
          </div>
        </div>
      </div>

      {/* Hidden printable content for react-to-print */}
      <div style={{ display: 'none' }}>
        <PrintableContent
          ref={printRef}
          images={printableImages}
          imagesPerPage={imagesPerPage}
        />
      </div>

      {/* PDF Crop Choice Modal */}
      {choiceModal.isOpen && choiceModal.pdfFiles.length > 0 && (
        <PdfCropChoiceModal
          pdfFiles={choiceModal.pdfFiles}
          onAutoCropAll={handleAutoCropAll}
          onManualCrop={handleManualCrop}
          onClose={() => {
            // Remove PDFs if user closes without choosing
            const pdfIds = choiceModal.pdfFiles.map((pdf) => pdf.id);
            setImages((prev) => prev.filter((img) => !pdfIds.includes(img.id)));
            setChoiceModal({ isOpen: false, pdfFiles: [] });
          }}
        />
      )}

      {/* Auto Crop Progress Modal */}
      {autoCropProgress.isOpen && autoCropProgress.pdfFiles.length > 0 && (
        <AutoCropProgressModal
          pdfFiles={autoCropProgress.pdfFiles}
          onComplete={handleAutoCropComplete}
          onClose={() => {
            setAutoCropProgress({ isOpen: false, pdfFiles: [] });
          }}
        />
      )}

      {/* PDF Cropper Modal (Manual) */}
      {cropperModal.isOpen && cropperModal.pdfFile && cropperModal.pdfId && (
        <PdfCropperModal
          pdfFile={cropperModal.pdfFile}
          pdfId={cropperModal.pdfId}
          onCropped={handlePdfCropped}
          onClose={() => {
            // When modal is closed without cropping, remove the PDF and continue to next
            setImages((prev) => prev.filter((img) => img.id !== cropperModal.pdfId));
            setCropperModal({ isOpen: false, pdfFile: null, pdfId: null });
          }}
        />
      )}
    </div>
  );
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
