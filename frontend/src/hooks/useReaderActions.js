import { useState, useCallback } from 'react';
import { getRecapResponse, getQAResponse, getLookUpResponse } from '../services/textProcessingService';

export const useReaderActions = (renditionRef, selectedText, addNewHighlight, clearSelection, toggleSidebar, currentPageText) => {
  const [lookupText, setLookupText] = useState('');
  const [lookupSelectedText, setLookupSelectedText] = useState('');

  const handleRecap = useCallback(async () => {
    return await getRecapResponse(renditionRef);
  }, [renditionRef]);

  const handleQA = useCallback(async (query) => {
    if (!query || !renditionRef.current) return 'No question provided or reader not ready.';

    try {
      const hasSelection = selectedText?.text;
      const selectedTextContent = hasSelection ? selectedText.text : '';
      const selectedContainerText = hasSelection && selectedText.range?.startContainer?.data 
        ? selectedText.range.startContainer.data 
        : '';
      
      return await getQAResponse(
        query, 
        renditionRef, 
        selectedTextContent, 
        selectedContainerText, 
        hasSelection,
        currentPageText
      );
    } catch (error) {
      console.error('Error in handleQA:', error);
      return 'Sorry, there was an error processing your question. Please try again.';
    }
  }, [selectedText, renditionRef, currentPageText]);

  const handleLookup = useCallback(async () => {
    if (!selectedText) return;
    
    setLookupSelectedText(selectedText.text);
    toggleSidebar();
    setLookupText('Loading...');
    
    const response = await getLookUpResponse(
      renditionRef, 
      selectedText.text, 
      selectedText.range.startContainer.data
    );
    setLookupText(response);
  }, [selectedText, renditionRef, toggleSidebar]);

  const handleHighlight = useCallback(async () => {
    await addNewHighlight(selectedText);
    clearSelection();
  }, [selectedText, addNewHighlight, clearSelection]);

  return {
    lookupText,
    lookupSelectedText,
    handleRecap,
    handleQA,
    handleLookup,
    handleHighlight
  };
};