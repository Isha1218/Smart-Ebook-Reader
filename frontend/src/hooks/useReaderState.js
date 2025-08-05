import { useState, useRef, useCallback } from 'react';

export const useReaderState = () => {
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const renditionRef = useRef(null);

  const handleTocChanged = useCallback((toc) => {
    setChapters(toc);
  }, []);

  const handleLocationChanged = useCallback((epubcifi) => {
    if (renditionRef.current) {
      const { start } = renditionRef.current.location;
      if (start && start.displayed) {
        const { page, total } = start.displayed;
        const pagesLeft = total - page;
        setCurrentPage(`${pagesLeft} page${pagesLeft !== 1 ? 's' : ''} left`);
      }
    }
  }, []);

  const handleGetRendition = useCallback((rendition, applyHighlights, clearSelection) => {
    renditionRef.current = rendition;
    renditionRef.current.themes.fontSize('180%');
    
    applyHighlights();

    renditionRef.current.on('selected', (cfiRange, contents) => {
      try {
        const selection = contents.window.getSelection();
        const selectedTextContent = selection.toString().trim();
        
        if (selectedTextContent.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframe = renditionRef.current.manager.container.querySelector('iframe');
          const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };
          
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

    renditionRef.current.on('clicked', () => {
      clearSelection();
    });
  }, []);

  return {
    renditionRef,
    chapters,
    currentPage,
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition
  };
};