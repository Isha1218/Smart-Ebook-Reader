import { doQA, fastLookup, getRecap } from './apiService';
import { extractCurrentPageText } from '../utils/textExtraction';

const CHAR_LIMIT = 100;

const extractTextFromDocument = (doc) => {
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

const loadPreviousChapters = async (rendition, spine, previousChapterIndex, charLimit = null) => {
  let previousChaptersText = '';
  
  while (previousChapterIndex >= 0 && (!charLimit || previousChaptersText.length <= charLimit)) {
    const section = await rendition.book.load(spine[previousChapterIndex--].href);
    previousChaptersText = extractTextFromDocument(section) + previousChaptersText;
  }
  
  return previousChaptersText;
};

const getBookContext = async (rendition) => {
  const location = rendition.location?.start;
  if (!location) throw new Error('Current location not available.');
  
  const spine = rendition.book.spine.spineItems || [];
  const currentIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currentIndex === -1) throw new Error('Could not locate current position in book.');
  
  return { spine, currentIndex, location };
};

const buildContextText = async (rendition, spine, currentIndex, useCharLimit = true) => {
  const charLimit = useCharLimit ? CHAR_LIMIT : null;
  let contextText = await loadPreviousChapters(rendition, spine, currentIndex - 1, charLimit);
  
  const currentSection = await rendition.book.load(spine[currentIndex].href);
  const chapterText = extractTextFromDocument(currentSection).trim().replace(/\s+/g, ' ');
  
  const { cfi: startCfi } = rendition.location.start;
  const { cfi: endCfi } = rendition.location.end;
  const range = await rendition.getRange(`epubcfi(${startCfi.replace(/^epubcfi\(|\)$/g, '')},${endCfi.replace(/^epubcfi\(|\)$/g, '')})`);
  const pageText = range.startContainer.data.trim().replace(/\s+/g, ' ');
  const index = chapterText.indexOf(pageText);
  
  return index === -1 ? contextText : contextText + chapterText.slice(0, index);
};

export const getQAResponse = async (query, renditionRef, selectedText, selectedContainerText, isSelected, currentPageText) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const { spine, currentIndex } = await getBookContext(rendition);
  const contextText = await buildContextText(rendition, spine, currentIndex, false);

  let freshCurrentPageText;
  try {
    freshCurrentPageText = await extractCurrentPageText(rendition, 100);
    console.log('Fresh current page text extracted:', {
      length: freshCurrentPageText.length,
      preview: freshCurrentPageText.substring(0, 100) + '...'
    });
  } catch (error) {
    console.error('Failed to extract fresh page text, using fallback:', error);
    freshCurrentPageText = currentPageText;
  }

  console.log('Using current page text:', freshCurrentPageText);
  
  const qaResponse = await doQA(query, contextText, selectedText, freshCurrentPageText);
  console.log(qaResponse);
  return qaResponse;
};

export const getLookUpResponse = async (renditionRef, selectedText, selectedContainerText) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const { spine, currentIndex } = await getBookContext(rendition);
  let contextText = await loadPreviousChapters(rendition, spine, currentIndex - 1, CHAR_LIMIT);
  
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

  const { spine, currentIndex } = await getBookContext(rendition);
  const contextText = await buildContextText(rendition, spine, currentIndex);
  
  return await getRecap(contextText);
};