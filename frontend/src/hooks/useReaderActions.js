import { useState, useCallback } from 'react';
import { getRecapResponse, getQAResponse, getLookUpResponse } from '../services/textProcessingService';

export const useReaderActions = (renditionRef, selectedText, addNewHighlight, clearSelection, toggleSidebar, currentPageText) => {
  const [lookUpText, setLookUpText] = useState('');
  const [lookUpSelectedText, setLookUpSelectedText] = useState('');

  const handleRecap = useCallback(async () => {
    return await getRecapResponse(renditionRef);
  }, [renditionRef]);

  const handleQA = useCallback(async (query) => {
    if (!query || !renditionRef.current) return 'No question provided or reader not ready.';

    console.log('in handle qa ' + currentPageText);
    
    try {
      const isSelected = selectedText && selectedText.text;
      const selectedTextContent = isSelected ? selectedText.text : '';
      const selectedContainerText = isSelected && selectedText.range?.startContainer?.data 
        ? selectedText.range.startContainer.data 
        : '';
      
      const qaResponse = await getQAResponse(
        query, 
        renditionRef, 
        selectedTextContent, 
        selectedContainerText, 
        isSelected,
        currentPageText
      );
      
      return qaResponse;
    } catch (error) {
      console.error('Error in handleQA:', error);
      return 'Sorry, there was an error processing your question. Please try again.';
    }
  }, [selectedText, renditionRef]);

  const handleLookup = useCallback(async () => {
    if (!selectedText) return;
    
    setLookUpSelectedText(selectedText.text);
    toggleSidebar();
    setLookUpText('Loading...');
    
    const lookUpResponse = await getLookUpResponse(
      renditionRef, 
      selectedText.text, 
      selectedText.range.startContainer.data
    );
    setLookUpText(lookUpResponse);
  }, [selectedText, renditionRef]);

  const handleHighlight = useCallback(async () => {
    await addNewHighlight(selectedText);
    clearSelection();
  }, [selectedText, addNewHighlight, clearSelection]);

  return {
    lookUpText,
    lookUpSelectedText,
    handleRecap,
    handleQA,
    handleLookup,
    handleHighlight
  };
};