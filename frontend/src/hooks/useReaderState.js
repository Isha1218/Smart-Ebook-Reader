import { useState, useRef, useCallback } from 'react';

export const useReaderState = () => {
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState('');
  const [currentPageText, setCurrentPageText] = useState('');
  const renditionRef = useRef(null);

  // Extract text using Intersection Observer for precise visible text detection
  const extractCurrentPageText = useCallback((rendition) => {
    return new Promise((resolve) => {
      try {
        const iframe = rendition.manager.container.querySelector('iframe');
        if (!iframe) {
          resolve('');
          return;
        }

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc) {
          resolve('');
          return;
        }

        const textElements = Array.from(iframeDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
        const visibleElements = [];

        // Create intersection observer inside iframe
        const observer = new (iframe.contentWindow.IntersectionObserver)((entries) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio > 0.5) { // At least 50% visible
              const element = entry.target;
              const textContent = element.textContent?.trim();
              if (textContent && !visibleElements.some(el => el.element === element)) {
                visibleElements.push({
                  element,
                  text: textContent,
                  tagName: element.tagName.toLowerCase()
                });
              }
            }
          });
        }, {
          threshold: [0.1, 0.5, 0.9],
          root: null // Use viewport as root
        });

        // Observe all text elements
        textElements.forEach(el => observer.observe(el));

        // Wait for observations to complete
        setTimeout(() => {
          observer.disconnect();
          
          // Sort by document order
          visibleElements.sort((a, b) => {
            const position = a.element.compareDocumentPosition(b.element);
            return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });

          // Format text based on element types
          let pageText = '';
          visibleElements.forEach(({ text, tagName }) => {
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              pageText += `\n\n${text}\n\n`;
            } else if (tagName === 'p') {
              pageText += `${text}\n\n`;
            } else {
              pageText += `${text} `;
            }
          });

          resolve(pageText.trim());
        }, 300);

      } catch (error) {
        console.error('Error extracting page text:', error);
        resolve('');
      }
    });
  }, []);

  const handleTocChanged = useCallback((toc) => {
    setChapters(toc);
  }, []);

  const handleLocationChanged = useCallback(async (epubcifi) => {
    if (renditionRef.current) {
      // Update page info
      const { start } = renditionRef.current.location;
      if (start && start.displayed) {
        const { page, total } = start.displayed;
        const pagesLeft = total - page;
        setCurrentPage(`${pagesLeft} page${pagesLeft !== 1 ? 's' : ''} left`);
      }

      // Extract current page text
      try {
        setTimeout(async () => {
          const pageText = await extractCurrentPageText(renditionRef.current);
          setCurrentPageText(pageText);
          
          // Optional: Log the extracted text
          console.log('=== Current Page Text ===');
          console.log(`Length: ${pageText.length} characters`);
          console.log(pageText);
          console.log('=== End Page Text ===');
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('pageTextExtracted', { 
            detail: { 
              text: pageText,
              cfi: epubcifi,
              pageInfo: start?.displayed 
            }
          }));
        }, 300);
      } catch (error) {
        console.error('Error during text extraction:', error);
      }
    }
  }, [extractCurrentPageText]);

  const handleGetRendition = useCallback((rendition, applyHighlights, clearSelection) => {
    renditionRef.current = rendition;
    renditionRef.current.themes.fontSize('180%');
    
    applyHighlights();

    // Extract initial page text
    setTimeout(async () => {
      const initialPageText = await extractCurrentPageText(rendition);
      setCurrentPageText(initialPageText);
      console.log('=== Initial Page Text ===');
      console.log(initialPageText);
      console.log('=== End Initial Page Text ===');
    }, 500);

    // Handle text selection
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

    // Handle page navigation
    renditionRef.current.on('relocated', async (location) => {
      try {
        setTimeout(async () => {
          const pageText = await extractCurrentPageText(renditionRef.current);
          setCurrentPageText(pageText);
          console.log('=== Page Changed ===');
          console.log(`New page text (${pageText.length} chars):`, pageText);
        }, 300);
      } catch (error) {
        console.error('Error extracting text on relocated:', error);
      }
    });
  }, [extractCurrentPageText]);

  return {
    renditionRef,
    chapters,
    currentPage,
    currentPageText,
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition,
    extractCurrentPageText // Expose for manual use if needed
  };
};