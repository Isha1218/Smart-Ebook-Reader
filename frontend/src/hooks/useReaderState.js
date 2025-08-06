import { useState, useRef, useCallback } from 'react';
import { extractCurrentPageText } from '../utils/textExtraction';

const EXTRACTION_DELAY = 300;

export const useReaderState = () => {
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const [currentPageText, setCurrentPageText] = useState('');
  const renditionRef = useRef(null);

  const updatePageText = useCallback(async (epubcifi) => {
    if (!renditionRef.current) return;
    
    try {
      setTimeout(async () => {
        const pageText = await extractCurrentPageText(renditionRef.current);
        setCurrentPageText(pageText);
        
        console.log('=== Current Page Text ===');
        console.log(`Length: ${pageText.length} characters`);
        console.log(pageText);
        console.log('=== End Page Text ===');
        
        window.dispatchEvent(new CustomEvent('pageTextExtracted', { 
          detail: { 
            text: pageText,
            cfi: epubcifi,
            pageInfo: renditionRef.current.location?.start?.displayed
          }
        }));
      }, EXTRACTION_DELAY);
    } catch (error) {
      console.error('Error during text extraction:', error);
    }
  }, []);

  const handleTocChanged = useCallback((toc) => {
    setChapters(toc);
  }, []);

  const handleLocationChanged = useCallback(async (epubcifi) => {
    if (!renditionRef.current) return;

    const { start } = renditionRef.current.location;
    if (start?.displayed) {
      const { page, total } = start.displayed;
      const pagesLeft = total - page;
      setCurrentPage(`${pagesLeft} page${pagesLeft !== 1 ? 's' : ''} left`);
    }

    updatePageText(epubcifi);
  }, [updatePageText]);

  const setupEventHandlers = useCallback((rendition, applyHighlights, clearSelection) => {
    rendition.on('selected', (cfiRange, contents) => {
      try {
        const selection = contents.window.getSelection();
        const selectedTextContent = selection.toString().trim();
        
        if (selectedTextContent.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframe = rendition.manager.container.querySelector('iframe');
          const iframeRect = iframe?.getBoundingClientRect() || { left: 0, top: 0 };
          
          const selectedTextData = {
            text: selectedTextContent,
            range: range,
            cfiRange: cfiRange
          };
          
          const position = {
            x: iframeRect.left + rect.left + (rect.width / 2),
            y: iframeRect.top + rect.top - 10
          };

          window.dispatchEvent(new CustomEvent('textSelected', { 
            detail: { selectedText: selectedTextData, position }
          }));
        }
      } catch (error) {
        console.error('Error in selected event:', error);
      }
    });

    rendition.on('clicked', clearSelection);

    rendition.on('relocated', async () => {
      try {
        setTimeout(async () => {
          const pageText = await extractCurrentPageText(rendition);
          setCurrentPageText(pageText);
          console.log('=== Page Changed ===');
          console.log(`New page text (${pageText.length} chars):`, pageText);
        }, EXTRACTION_DELAY);
      } catch (error) {
        console.error('Error extracting text on relocated:', error);
      }
    });
  }, []);

  const handleGetRendition = useCallback((rendition, applyHighlights, clearSelection) => {
    renditionRef.current = rendition;
    rendition.themes.fontSize('180%');
    
    applyHighlights();
    setupEventHandlers(rendition, applyHighlights, clearSelection);

    setTimeout(async () => {
      const initialPageText = await extractCurrentPageText(rendition);
      setCurrentPageText(initialPageText);
      console.log('=== Initial Page Text ===');
      console.log(initialPageText);
      console.log('=== End Initial Page Text ===');
    }, 500);
  }, [setupEventHandlers]);

  return {
    renditionRef,
    chapters,
    currentPage,
    currentPageText,
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition
  };
};