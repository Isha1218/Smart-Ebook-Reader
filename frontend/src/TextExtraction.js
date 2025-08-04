import { doQA, fastLookup, getRecap } from "./Api";

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

export const getPrevChapters = async (rendition, spine, prevChapterIndex) => {
  let prevChaptersText = '';
  while (prevChapterIndex >= 0 && prevChaptersText.length <= 100) {
    const section = await rendition.book.load(spine[prevChapterIndex--].href);
    prevChaptersText = extractTextFromDocument(section) + prevChaptersText;
  }
  return prevChaptersText;
}

export const getAllPrevChapters = async (rendition, spine, prevChapterIndex) => {
  let prevChaptersText = '';
  while (prevChapterIndex >= 0) {
    const section = await rendition.book.load(spine[prevChapterIndex--].href);
    prevChaptersText = extractTextFromDocument(section) + prevChaptersText;
  }
  return prevChaptersText;
}

export const getQAResponse = async (query, renditionRef, selectedText, selectedContainerText, isSelected, currentPageText) => {
  
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const location = rendition.location?.start;
  if (!location) return 'Current location not available.';
  
  const spine = rendition.book.spine.spineItems || [];
  const currIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currIndex === -1) return 'Could not locate current position in book.';
  
  let recapText = await getAllPrevChapters(rendition, spine, currIndex - 1);

  console.log('curr page text ' + currentPageText)

  if (isSelected) {
    const currSection = await rendition.book.load(spine[currIndex].href);
    const chapterText = extractTextFromDocument(currSection).trim().replace(/\s+/g, ' ');
    selectedContainerText = selectedContainerText.trim().replace(/\s+/g, ' ');
    const index = chapterText.indexOf(selectedContainerText);  
    recapText = recapText + selectedContainerText.slice(0, index);
  } else {
    const currSection = await rendition.book.load(spine[currIndex].href);
    const chapterText = extractTextFromDocument(currSection).trim().replace(/\s+/g, ' ');
    const { cfi: startCfi } = rendition.location.start;
    const { cfi: endCfi } = rendition.location.end;
    const range = await rendition.getRange(`epubcfi(${startCfi.replace(/^epubcfi\(|\)$/g, '')},${endCfi.replace(/^epubcfi\(|\)$/g, '')})`);
    const pageText = range.startContainer.data.trim().replace(/\s+/g, ' ');
    const index = chapterText.indexOf(pageText);  
    recapText = index === -1 ? recapText : recapText + chapterText.slice(0, index);
  }
  const qaResponse = await doQA(query, recapText, selectedText);
  console.log(qaResponse);
  return qaResponse;
}

export const getLookUpResponse = async (renditionRef, selectedText, selectedContainerText) => {
  const rendition = renditionRef.current;
  if (!rendition?.book) return 'Missing rendition or book.';
  
  const location = rendition.location?.start;
  if (!location) return 'Current location not available.';
  
  const spine = rendition.book.spine.spineItems || [];
  const currIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
  if (currIndex === -1) return 'Could not locate current position in book.';
  
  let recapText = await getPrevChapters(rendition, spine, currIndex - 1);
  const currSection = await rendition.book.load(spine[currIndex].href);
  const chapterText = extractTextFromDocument(currSection).trim().replace(/\s+/g, ' ');
  selectedContainerText = selectedContainerText.trim().replace(/\s+/g, ' ');
  const index = chapterText.indexOf(selectedContainerText);  
  recapText = recapText + selectedContainerText.slice(0, index);
  const lookUpResponse = await fastLookup(selectedText, recapText);
  console.log(lookUpResponse);
  return lookUpResponse
}
  

export const getRecapResponse = async (renditionRef) => {
    const rendition = renditionRef.current;
    if (!rendition?.book) return 'Missing rendition or book.';
  
    const location = rendition.location?.start;
    if (!location) return 'Current location not available.';
  
    const spine = rendition.book.spine.spineItems || [];
    const currIndex = spine.findIndex(item => item.href === location.href || item.idref === location.href);
    if (currIndex === -1) return 'Could not locate current position in book.';
  
    let recapText = await getPrevChapters(rendition, spine, currIndex - 1);

    const currSection = await rendition.book.load(spine[currIndex].href);
    const chapterText = extractTextFromDocument(currSection).trim().replace(/\s+/g, ' ');
    const { cfi: startCfi } = rendition.location.start;
    const { cfi: endCfi } = rendition.location.end;
    const range = await rendition.getRange(`epubcfi(${startCfi.replace(/^epubcfi\(|\)$/g, '')},${endCfi.replace(/^epubcfi\(|\)$/g, '')})`);
    const pageText = range.startContainer.data.trim().replace(/\s+/g, ' ');
    const index = chapterText.indexOf(pageText);  
    const recapResponse = await getRecap(index === -1 ? recapText : recapText + chapterText.slice(0, index));
    return recapResponse;
}