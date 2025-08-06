import { doQA, fastLookup, getRecap } from "./apiService";

export const extractTextFromDocument = (doc) => {
  if (!doc) return '';
  let textContent = '';
  
  if (doc.body) {
    textContent = doc.body.textContent || doc.body.innerText || '';
  } else if (doc.documentElement) {
    textContent = doc.documentElement.textContent || doc.documentElement.innerText || '';
  } else if (doc.textContent) {
    textContent = doc.textContent;
  } else if (typeof doc === 'string') {
    textContent = doc;
  } else {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = doc.toString();
    textContent = tempDiv.textContent || tempDiv.innerText || '';
  }
  return textContent.replace(/\s+/g, ' ').trim();
};

// Add the same text extraction logic from useReaderState
const extractCurrentPageTextDirect = (rendition) => {
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
      }, 100); // Reduced timeout since we're calling it on-demand

    } catch (error) {
      console.error('Error extracting page text:', error);
      resolve('');
    }
  });
};

export const getPreviousChapters = async (rendition, spine, previousChapterIndex) => {
  let previousChaptersText = '';
  while (previousChapterIndex >= 0 && previousChaptersText.length <= 100) {
    const section = await rendition.book.load(spine[previousChapterIndex--].href);
    previousChaptersText = extractTextFromDocument(section) + previousChaptersText;
  }
  return previousChaptersText;
};

export const getAllPreviousChapters = async (rendition, spine, previousChapterIndex) => {
  let previousChaptersText = '';
  while (previousChapterIndex >= 0) {
    const section = await rendition.book.load(spine[previousChapterIndex--].href);
    previousChaptersText = extractTextFromDocument(section) + previousChaptersText;
  }
  return previousChaptersText;
};

export const getQAResponse = async (query, renditionRef, selectedText, selectedContainerText, isSelected, currentPageText) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const location = rendition.location?.start;
  if (!location) return 'Current location not available.';
  
  const spine = rendition.book.spine.spineItems || [];
  const currentIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currentIndex === -1) return 'Could not locate current position in book.';
  
  let contextText = await getAllPreviousChapters(rendition, spine, currentIndex - 1);

  // Extract fresh current page text directly
  let freshCurrentPageText;
  try {
    freshCurrentPageText = await extractCurrentPageTextDirect(rendition);
    console.log('Fresh current page text extracted:', {
      length: freshCurrentPageText.length,
      preview: freshCurrentPageText.substring(0, 100) + '...'
    });
  } catch (error) {
    console.error('Failed to extract fresh page text, using fallback:', error);
    freshCurrentPageText = currentPageText; // Fallback to passed parameter
  }

  console.log('Using current page text:', freshCurrentPageText);

  if (isSelected) {
    const currentSection = await rendition.book.load(spine[currentIndex].href);
    const chapterText = extractTextFromDocument(currentSection).trim().replace(/\s+/g, ' ');
    selectedContainerText = selectedContainerText.trim().replace(/\s+/g, ' ');
    const index = chapterText.indexOf(selectedContainerText);  
    contextText = contextText + selectedContainerText.slice(0, index);
  } else {
    const currentSection = await rendition.book.load(spine[currentIndex].href);
    const chapterText = extractTextFromDocument(currentSection).trim().replace(/\s+/g, ' ');
    const { cfi: startCfi } = rendition.location.start;
    const { cfi: endCfi } = rendition.location.end;
    const range = await rendition.getRange(`epubcfi(${startCfi.replace(/^epubcfi\(|\)$/g, '')},${endCfi.replace(/^epubcfi\(|\)$/g, '')})`);
    const pageText = range.startContainer.data.trim().replace(/\s+/g, ' ');
    const index = chapterText.indexOf(pageText);  
    contextText = index === -1 ? contextText : contextText + chapterText.slice(0, index);
  }
  
  const qaResponse = await doQA(query, contextText, selectedText, freshCurrentPageText);
  console.log(qaResponse);
  return qaResponse;
};

export const getLookUpResponse = async (renditionRef, selectedText, selectedContainerText) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const location = rendition.location?.start;
  if (!location) return 'Current location not available.';
  
  const spine = rendition.book.spine.spineItems || [];
  const currentIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currentIndex === -1) return 'Could not locate current position in book.';
  
  let contextText = await getPreviousChapters(rendition, spine, currentIndex - 1);
  const currentSection = await rendition.book.load(spine[currentIndex].href);
  const chapterText = extractTextFromDocument(currentSection).trim().replace(/\s+/g, ' ');
  selectedContainerText = selectedContainerText.trim().replace(/\s+/g, ' ');
  const index = chapterText.indexOf(selectedContainerText);  
  contextText = contextText + selectedContainerText.slice(0, index);
  const lookUpResponse = await fastLookup(selectedText, contextText);
  console.log(lookUpResponse);
  return lookUpResponse;
};

export const getRecapResponse = async (renditionRef) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';

  const location = rendition.location?.start;
  if (!location) return 'Current location not available.';

  const spine = rendition.book.spine.spineItems || [];
  const currentIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currentIndex === -1) return 'Could not locate current position in book.';

  let contextText = await getPreviousChapters(rendition, spine, currentIndex - 1);

  const currentSection = await rendition.book.load(spine[currentIndex].href);
  const chapterText = extractTextFromDocument(currentSection).trim().replace(/\s+/g, ' ');
  const { cfi: startCfi } = rendition.location.start;
  const { cfi: endCfi } = rendition.location.end;
  const range = await rendition.getRange(`epubcfi(${startCfi.replace(/^epubcfi\(|\)$/g, '')},${endCfi.replace(/^epubcfi\(|\)$/g, '')})`);
  const pageText = range.startContainer.data.trim().replace(/\s+/g, ' ');
  const index = chapterText.indexOf(pageText);  
  const recapResponse = await getRecap(index === -1 ? contextText : contextText + chapterText.slice(0, index));
  return recapResponse;
};