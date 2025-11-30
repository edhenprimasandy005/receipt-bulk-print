'use client';

import { ProcessedImage } from '@/types';
import { useMemo } from 'react';

interface PrintPreviewA4Props {
  images: ProcessedImage[];
  imagesPerPage: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12 | 15 | 16;
}

export default function PrintPreviewA4({
  images,
  imagesPerPage,
}: PrintPreviewA4Props) {
  // Split images into pages
  const pages = useMemo(() => {
    const pages: ProcessedImage[][] = [];
    for (let i = 0; i < images.length; i += imagesPerPage) {
      pages.push(images.slice(i, i + imagesPerPage));
    }
    return pages;
  }, [images, imagesPerPage]);

  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Upload files to see preview
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Preview header - hidden in print */}
      <div className="no-print">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Print Preview ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Each image will be printed at 430×430px size (1:1 ratio)
          </p>
        </div>
      </div>

      {/* Print pages */}
      {pages.map((pageImages, pageIndex) => (
        <div
          key={pageIndex}
          className="print-area a4-page bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden no-print:shadow-xl no-print:mb-5 print-only"
          style={{
            width: '210mm',
            height: '297mm',
            margin: '0 auto 20px',
            padding: '4mm',
            boxSizing: 'border-box',
            maxWidth: '100%',
            aspectRatio: '210 / 297',
            overflow: 'hidden',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              ...getGridStyle(imagesPerPage),
              overflow: 'hidden',
            }}
          >
            {pageImages.map((image, imgIndex) => (
              <div
                key={image.id}
                className="border border-gray-200 dark:border-gray-700"
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '2mm',
                  boxSizing: 'border-box',
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="object-contain"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    aspectRatio: '1 / 1',
                  }}
                />
              </div>
            ))}
            {/* Fill empty slots if needed */}
            {Array.from({ length: imagesPerPage - pageImages.length }).map(
              (_, emptyIndex) => (
                <div
                  key={`empty-${emptyIndex}`}
                  className="border border-gray-200 dark:border-gray-700"
                  style={{
                    minWidth: 0,
                    minHeight: 0,
                  }}
                />
              )
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function getGridStyle(imagesPerPage: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12 | 15 | 16): React.CSSProperties {
  const baseStyle = {
    gap: '3mm',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
  };

  switch (imagesPerPage) {
    case 1:
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      };
    case 2:
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        ...baseStyle,
      };
    case 3:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: '1fr',
        ...baseStyle,
      };
    case 4:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        ...baseStyle,
      };
    case 6:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        ...baseStyle,
      };
    case 8:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        ...baseStyle,
      };
    case 9:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        ...baseStyle,
      };
    case 12:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        ...baseStyle,
      };
    case 15:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        ...baseStyle,
      };
    case 16:
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        ...baseStyle,
      };
    default:
      return {};
  }
}
