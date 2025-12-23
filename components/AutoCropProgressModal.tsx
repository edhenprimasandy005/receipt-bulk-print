'use client';

import { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import { ProcessedImage } from '@/types';
import { autoCropPdf } from '@/utils/pdfAutoCrop';

interface AutoCropProgressModalProps {
  pdfFiles: ProcessedImage[];
  onComplete: (results: Array<{ id: string; preview: string }>) => void;
  onClose: () => void;
}

export default function AutoCropProgressModal({
  pdfFiles,
  onComplete,
  onClose,
}: AutoCropProgressModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ id: string; preview: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAllPdfs = async () => {
      const processedResults: Array<{ id: string; preview: string }> = [];
      
      for (let i = 0; i < pdfFiles.length; i++) {
        setCurrentIndex(i);
        setError(null);
        
        try {
          const preview = await autoCropPdf(pdfFiles[i].file, 1);
          processedResults.push({
            id: pdfFiles[i].id,
            preview,
          });
          setResults([...processedResults]);
        } catch (err) {
          console.error(`Error auto-cropping PDF ${pdfFiles[i].file.name}:`, err);
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setError(`Gagal crop "${pdfFiles[i].file.name}": ${errorMsg}`);
          
          // Continue processing other files even if one fails
        }
        
        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      setIsProcessing(false);
      // Wait a bit before calling onComplete to show final state
      setTimeout(() => {
        onComplete(processedResults);
      }, 500);
    };

    if (pdfFiles.length > 0) {
      processAllPdfs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = pdfFiles.length > 0 ? ((currentIndex + 1) / pdfFiles.length) * 100 : 0;
  const currentFile = pdfFiles[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crop Otomatis PDF
          </h2>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X weight="bold" className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {isProcessing ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Memproses...</span>
                  <span>{currentIndex + 1} / {pdfFiles.length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {currentFile && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium">File saat ini:</p>
                  <p className="truncate">{currentFile.file.name}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selesai!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Berhasil crop {results.length} dari {pdfFiles.length} file PDF
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

