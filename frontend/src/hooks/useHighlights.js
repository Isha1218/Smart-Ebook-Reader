import { useState, useEffect, useCallback } from 'react';
import { fetchHighlights, addHighlight } from '../services/apiService';

export const useHighlights = (renditionRef, location) => {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    async function loadHighlights() {
      try {
        const dbHighlights = await fetchHighlights();
        setHighlights(dbHighlights);
      } catch (err) {
        console.error('Error loading highlights:', err);
      }
    }
    loadHighlights();
  }, []);

  const applyHighlights = useCallback(() => {
    if (!renditionRef.current || !highlights) return;
  
    const rendition = renditionRef.current;
  
    try {
      Object.values(rendition.annotations._annotations).forEach((annotation) => {
        if (annotation.type === 'highlight') {
          rendition.annotations.remove(annotation.cfiRange, 'highlight');
        }
      });
    } catch (error) {
      console.warn('Failed to clear previous highlights:', error);
    }
  
    highlights.forEach(highlight => {
      try {
        rendition.annotations.highlight(
          highlight.cfi_range,
          {},
          (e) => {
            console.log('Highlight clicked:', e);
          },
          undefined,
          {
            fill: 'yellow',
            'fill-opacity': '0.3',
            'mix-blend-mode': 'multiply'
          }
        );
      } catch (error) {
        console.error(`Error applying highlight for CFI ${highlight.cfi_range}:`, error);
      }
    });
  }, [highlights, renditionRef]);

  useEffect(() => {
    if (renditionRef.current) {
      applyHighlights();
    }
  }, [location, applyHighlights]);

  const addNewHighlight = useCallback(async (selectedText) => {
    if (!selectedText || !renditionRef.current) return;

    try {
      const highlightId = `highlight-${Date.now()}`;
      
      const newHighlight = {
        id: highlightId,
        text: selectedText.text,
        cfi_range: selectedText.cfiRange,
        timestamp: Date.now()
      };

      setHighlights(prev => [...prev, newHighlight]);
      
      await addHighlight(highlightId, selectedText.text, selectedText.cfiRange, 'Chapter 1');
    } catch (error) {
      console.error('Error creating highlight:', error);
    }
  }, [renditionRef]);

  return {
    highlights,
    applyHighlights,
    addNewHighlight
  };
};