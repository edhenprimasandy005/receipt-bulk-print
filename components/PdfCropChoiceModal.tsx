'use client';

import { useState } from 'react';
import { X, MagicWand, Hand } from 'phosphor-react';
import { ProcessedImage } from '@/types';

interface PdfCropChoiceModalProps {
  pdfFiles: ProcessedImage[];
  onAutoCropAll: () => void;
  onManualCrop: () => void;
  onClose: () => void;
}

export default function PdfCropChoiceModal({
  pdfFiles,
  onAutoCropAll,
  onManualCrop,
  onClose,
}: PdfCropChoiceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crop File PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X weight="bold" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Anda memiliki {pdfFiles.length} file PDF yang perlu di-crop. Bagaimana Anda ingin melanjutkan?
          </p>

          <div className="space-y-4">
            <button
              onClick={onAutoCropAll}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-3"
            >
              <MagicWand className="w-6 h-6" weight="bold" />
              <div className="text-left flex-1">
                <div className="font-semibold">Crop Otomatis Semua</div>
                <div className="text-sm text-green-100">
                  Otomatis crop semua PDF dari sudut kiri atas
                </div>
              </div>
            </button>

            <button
              onClick={onManualCrop}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-3"
            >
              <Hand className="w-6 h-6" weight="bold" />
              <div className="text-left flex-1">
                <div className="font-semibold">Crop Manual (Satu per Satu)</div>
                <div className="text-sm text-blue-100">
                  Tinjau dan crop setiap PDF secara manual
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

