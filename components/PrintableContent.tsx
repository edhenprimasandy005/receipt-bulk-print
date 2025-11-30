/* eslint-disable @next/next/no-img-element */
'use client';

import { ProcessedImage } from '@/types';
import { useMemo, forwardRef } from 'react';

interface PrintableContentProps {
  images: ProcessedImage[];
  imagesPerPage: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12 | 15 | 16;
}

const PrintableContent = forwardRef<HTMLDivElement, PrintableContentProps>(
  ({ images, imagesPerPage }, ref) => {
    const pages = useMemo(() => {
      const pages: ProcessedImage[][] = [];
      for (let i = 0; i < images.length; i += imagesPerPage) {
        pages.push(images.slice(i, i + imagesPerPage));
      }
      return pages;
    }, [images, imagesPerPage]);

    return (
      <div ref={ref}>
        {pages.map((pageImages, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-page"
            style={{
              width: '210mm',
              height: '297mm',
              margin: 0,
              padding: '8mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              pageBreakAfter: 'always',
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
                  className="border border-gray-200"
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '3mm',
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
                    className="border border-gray-200"
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
      </div>
    );
  }
);

PrintableContent.displayName = 'PrintableContent';

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

export default PrintableContent;

