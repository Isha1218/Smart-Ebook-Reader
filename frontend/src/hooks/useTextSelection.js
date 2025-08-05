import { useState, useCallback, useEffect } from 'react';

export const useTextSelection = (renditionRef) => {
  const [selectedText, setSelectedText] = useState(null);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState(null);

  const clearSelection = useCallback(() => {
    setSelectedText(null);
    setSelectionMenuPosition(null);
    
    if (renditionRef.current) {
      try {
        const contents = renditionRef.current.getContents();
        if (contents && contents.length > 0) {
          const selection = contents[0].window.getSelection();
          selection.removeAllRanges();
        }
      } catch (error) {
        console.error('Error clearing selection:', error);
      }
    }
  }, [renditionRef]);

  useEffect(() => {
    const handleTextSelected = (event) => {
      const { selectedText: textData, position } = event.detail;
      setSelectedText(textData);
      setSelectionMenuPosition(position);
    };

    window.addEventListener('textSelected', handleTextSelected);
    return () => window.removeEventListener('textSelected', handleTextSelected);
  }, []);

  return {
    selectedText,
    selectionMenuPosition,
    clearSelection
  };
};