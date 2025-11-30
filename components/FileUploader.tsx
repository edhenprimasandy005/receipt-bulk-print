'use client';

import { useCallback, useState } from 'react';
import { CloudArrowUp } from 'phosphor-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const acceptedFiles = Array.from(files).filter((file) => {
        const validTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf',
        ];
        return validTypes.includes(file.type);
      });

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }
      `}
    >
        <input
        type="file"
        id="file-upload"
        multiple
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => {
          handleFileSelect(e.target.files);
          // Reset input so same file can be selected again
          e.target.value = '';
        }}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center"
      >
        <CloudArrowUp
          className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
          weight="duotone"
        />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isDragging ? 'Drop files here' : 'Click or drag files here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Format: JPG, PNG, PDF
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          You can upload multiple files at once
        </p>
      </label>
    </div>
  );
}
