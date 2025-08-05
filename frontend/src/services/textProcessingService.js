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

  console.log('curr page text ' + currentPageText);

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
  
  const qaResponse = await doQA(query, contextText, selectedText);
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