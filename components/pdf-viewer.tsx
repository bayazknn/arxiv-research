'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Import PDFDocumentProxy directly from pdfjs-dist
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfViewerProps {
  pdfUrl: string;
  width?: number;
}

const getLocalStorageKey = (url: string) => `pdf_text_cache_${btoa(url)}`;

export default function PdfViewer({ pdfUrl, width = 800 }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isTextExtracting, setIsTextExtracting] = useState<boolean>(false);
  let fullText = ""

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.min.mjs`;
      } catch (error) {
        console.error('Error setting up PDF.js worker:', error);
        setError('Failed to load PDF viewer. Please refresh the page.');
      }
    }
    
  }, []);

  const getProxyPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/api/pdf-proxy')) return url;
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
  };

  const extractAndStorePdfText = useCallback(async (pdfDocument: PDFDocumentProxy, originalPdfUrl: string) => {
    // const localStorageKey = getLocalStorageKey(originalPdfUrllocalStorageKey);
    const localStorageKey = "pdf-content"

    // if (typeof window !== 'undefined') {
    //   const cachedText = localStorage.getItem(localStorageKey);
    //   if (cachedText) {
    //     console.log('PDF text loaded from localStorage.');
    //     setPdfText(cachedText);
    //     return;
    //   }
    // }

    setIsTextExtracting(true);
    console.log('Extracting PDF text...');
    try {
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => ('str' in item ? item.str : ''))
          .join(' ');
        // fullText +=  (i < pdfDocument.numPages ? `\n\n\n--------------------------Page ${i}--------------------------\n` + pageText : pageText)
        fullText +=  `\n\n\n--------------------------Page ${i}--------------------------\n` + pageText
      }

      console.log("pdfDocument.numPages", pdfDocument.numPages)

      localStorage.setItem(localStorageKey, fullText);
      setPdfText(fullText);

    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Failed to extract text from PDF.');
    } finally {
      setIsTextExtracting(false);
    }
  }, []);

  // Corrected onDocumentLoadSuccess function:
  // The 'document' parameter directly receives the PDFDocumentProxy object
  const onDocumentLoadSuccess = useCallback(
    (document: PDFDocumentProxy) => { // Type 'document' directly as PDFDocumentProxy
      setNumPages(document.numPages);
      extractAndStorePdfText(document, pdfUrl);
    },
    [extractAndStorePdfText, pdfUrl],
  );

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

      {/* <div className="p-4 bg-white border-t border-gray-200 mt-4">
        <h3>Extracted Text:</h3>
        {isTextExtracting && (
          <p className="text-gray-600">Extracting text from PDF...</p>
        )}
        {pdfText && !isTextExtracting && (
          <div className="border p-2 bg-gray-50 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm">
            {pdfText}
          </div>
        )}
        {!pdfText && !isTextExtracting && !error && (
            <p className="text-gray-400">No text extracted yet.</p>
        )}
      </div> */}
    </div>
  );
}