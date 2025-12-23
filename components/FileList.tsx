'use client';

import { ProcessedImage } from '@/types';
import { Trash } from 'phosphor-react';

interface FileListProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
}

export default function FileList({ images, onRemove }: FileListProps) {
  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Belum ada file yang diunggah
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow max-h-64 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        File Terunggah ({images.length})
      </h3>
      <div className="space-y-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
              {image.isPdf ? (
                <span className="text-xs">PDF</span>
              ) : image.preview ? (
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-xs">...</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {image.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {image.isPdf
                  ? 'PDF - Menunggu crop'
                  : image.preview
                  ? 'Siap'
                  : 'Memproses...'}
              </p>
            </div>
            <button
              onClick={() => onRemove(image.id)}
              className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Hapus"
            >
              <Trash
                className="w-5 h-5"
                weight="regular"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
