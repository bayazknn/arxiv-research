'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


interface PdfViewerProps {
  pdfUrl: string;
  width?: number;
}

export default function PdfViewer({ pdfUrl, width = 800 }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);

  // Set up the worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Set the worker source to the correct path
        // Use the local worker file
        pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.min.mjs`;
      } catch (error) {
        console.error('Error setting up PDF.js worker:', error);
        setError('Failed to load PDF viewer. Please refresh the page.');
      }
    }
  }, []);

  // Format the PDF URL to use our proxy
  const getProxyPdfUrl = (url: string) => {
    if (!url) return '';
    // If it's already a proxy URL, return as is
    if (url.includes('/api/pdf-proxy')) return url;
    // Otherwise, create a proxy URL
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(`Failed to load PDF: ${error.message}. Please try again or check the URL.`);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(numPages, prev + 1));
    }
  };

  const zoomIn = () => setScale(prev => Math.min(2, prev + 0.1));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.1));

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 text-red-600 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            -
          </button>
          <span className="w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          <Document
            file={getProxyPdfUrl(pdfUrl)}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p>Loading PDF...</p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={width}
              className="border border-gray-200"
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p>Loading page {pageNumber}...</p>
                  </div>
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
