const EXTRACTION_DELAY = 300;
const INTERSECTION_THRESHOLDS = [0.1, 0.5, 0.9];

const getTextElements = (doc) => Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));

const sortElementsByPosition = (elements) => {
  return elements.sort((a, b) => {
    const position = a.element.compareDocumentPosition(b.element);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
};

const formatTextByTag = (text, tagName) => {
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return `\n\n${text}\n\n`;
  } else if (tagName === 'p') {
    return `${text}\n\n`;
  }
  return `${text} `;
};

export const extractCurrentPageText = (rendition, delay = EXTRACTION_DELAY) => {
  return new Promise((resolve) => {
    try {
      const iframe = rendition.manager.container.querySelector('iframe');
      const iframeDoc = iframe?.contentDocument || iframe?.contentWindow.document;
      
      if (!iframe || !iframeDoc) {
        resolve('');
        return;
      }

      const textElements = getTextElements(iframeDoc);
      const visibleElements = [];

      const observer = new (iframe.contentWindow.IntersectionObserver)((entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0.5) {
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
        threshold: INTERSECTION_THRESHOLDS,
        root: null 
      });

      textElements.forEach(el => observer.observe(el));

      setTimeout(() => {
        observer.disconnect();
        
        const sortedElements = sortElementsByPosition(visibleElements);
        const pageText = sortedElements
          .map(({ text, tagName }) => formatTextByTag(text, tagName))
          .join('')
          .trim();

        resolve(pageText);
      }, delay);

    } catch (error) {
      console.error('Error extracting page text:', error);
      resolve('');
    }
  });
};