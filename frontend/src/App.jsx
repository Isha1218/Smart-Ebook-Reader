import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import './App.css';
import { ReactReader } from 'react-reader'
import { AiOutlineMenu } from 'react-icons/ai';
import '@fontsource-variable/open-sans';
import { getLookUpResponse, getRecapResponse, getQAResponse } from './TextExtraction';
import { addHighlight } from './Api';
import { fetchHighlights } from './Api';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useState(0);
  const renditionRef = useRef(null);
  const [chapters, setChapters] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState(null);
  const [page, setPage] = useState('');
  const tocRef = useRef(null);
  const [highlights, setHighlights] = useState([]);
  const [lookUpText, setLookUpText] = useState('')
  const [lookUpSelectedText, setLookUpSelectedText] = useState('')

  const handleTocChanged = (toc) => {
    setChapters(toc);
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goToChapter = (cfi) => {
    setLocation(cfi);
  }

  const locationChanged = useCallback((epubcifi) => {
    if (renditionRef.current) {
      const { start } = renditionRef.current.location;
      if (start && start.displayed) {
        const { page, total } = start.displayed;
        const pagesLeft = total - page;
        setPage(`${pagesLeft} page${pagesLeft !== 1 ? 's' : ''} left`);
      }
    }
  }, []);

  const handleRecap = () => {
    return getRecapResponse(renditionRef);
  }

  const handleQA = useCallback(async (query) => {
    if (!query || !renditionRef.current) return 'No question provided or reader not ready.';
    
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
        isSelected
      );
      
      return qaResponse;
    } catch (error) {
      console.error('Error in handleQA:', error);
      return 'Sorry, there was an error processing your question. Please try again.';
    }
  }, [selectedText]);


  // Use a single useEffect for fetching highlights on initial load.
  useEffect(() => {
    async function loadHighlights() {
      try {
        const dbHighlights = await fetchHighlights();
        console.log(dbHighlights)
        setHighlights(dbHighlights);
      } catch (err) {
        console.error('Error loading highlights:', err);
      }
    }
    loadHighlights();
  }, []);

  // Use a dedicated useCallback function to apply highlights,
  // making it clear this is a manual, atomic operation.
  const applyHighlights = useCallback(() => {
    if (!renditionRef.current || !highlights) return;
  
    // console.log('Clearing and re-applying highlights...');
  
    // // Remove all previous annotations by ID
    // if (renditionRef.current.annotations && renditionRef.current.annotations._annotations) {
    //   Object.keys(renditionRef.current.annotations._annotations).forEach((id) => {
    //     try {
    //       renditionRef.current.annotations.remove(id, 'highlight');
    //     } catch (e) {
    //       console.warn(`Could not remove highlight with ID ${id}:`, e);
    //     }
    //   });
    // }
  
    // Apply all highlights again with their unique IDs
    highlights.forEach((highlight) => {
      try {
        renditionRef.current.annotations.highlight(
          highlight.cfi_range,
          { id: highlight.id }, // 👈 Provide a unique ID
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
  }, [highlights]);
  

  // This useEffect will re-run `applyHighlights` whenever the location changes.
  // This is the main way to handle navigation.
  useEffect(() => {
    // Only run if the rendition is ready.
    if (renditionRef.current) {
        applyHighlights();
    }
  }, [location, applyHighlights]);


  const handleHighlight = useCallback(async () => {
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

      // IMPORTANT: After adding the new highlight to state, we need to manually
      // trigger the application. We call our dedicated function here.
      applyHighlights();
      
      await addHighlight(selectedText.text, selectedText.cfiRange, 'Chapter 1', highlightId)
      
      clearSelection();
    } catch (error) {
      console.error('Error creating highlight:', error);
    }
  }, [selectedText, applyHighlights]);

  const handleLookUp = useCallback(async () => {
    if (!selectedText) return;
    setLookUpSelectedText(selectedText.text)
    setLookUpText('Loading...')
    setIsSidebarOpen(true); // Open the sidebar
    const lookUpResponse = await getLookUpResponse(renditionRef, selectedText.text, selectedText.range.startContainer.data);
    setLookUpText(lookUpResponse);
  }, [selectedText]);

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
  }, []);
  
  return (
    <div className="app-container">
      <div className={`main-content ${isSidebarOpen ? 'pushed' : ''}`} style={{ height: '100vh'}}>
        <button onClick={toggleSidebar} className="menu-button"><AiOutlineMenu /></button>
        <ReactReader
          url={process.env.PUBLIC_URL + '/A_Court_of_Wings_and_Ruin_by_Sarah_J_Maas.epub'}
          location={location}
          locationChanged={locationChanged}
          showToc={false}
          epubOptions={{ 
            spread: 'none', 
            allowPopups: true, 
            allowScriptedContent: true 
          }}
          swipeable={false}
          getRendition={rendition => {
            renditionRef.current = rendition;
            renditionRef.current.themes.fontSize('180%');
            
            // Also apply highlights when the rendition is first ready
            applyHighlights();

            renditionRef.current.on('selected', (cfiRange, contents) => {
              try {
                const selection = contents.window.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText.length > 0) {
                  const range = selection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  const iframe = renditionRef.current.manager.container.querySelector('iframe');
                  const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };
                  
                  setSelectedText({
                    text: selectedText,
                    range: range,
                    cfiRange: cfiRange
                  });
                  
                  setSelectionMenuPosition({
                    x: iframeRect.left + rect.left + (rect.width / 2),
                    y: iframeRect.top + rect.top - 10
                  });
                }
              } catch (error) {
                console.error('Error in selected event:', error);
              }
            });
            renditionRef.current.on('clicked', () => {
              clearSelection();
            });
          }}
          tocChanged={handleTocChanged}
        />
        
        {selectionMenuPosition && selectedText && (
          <div 
            className="selection-menu"
            style={{
              position: 'fixed',
              left: selectionMenuPosition.x,
              top: selectionMenuPosition.y - 50,
              transform: 'translateX(-50%)',
              background: '#000',
              color: '#fff',
              borderRadius: '4px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)', 
              zIndex: 1000,
              display: 'flex',
              gap: '12px',
              fontSize: '14px',
              border: '1px solid #333'
            }}
          >
            <button
              onClick={handleHighlight}
              style={{
                background: 'transparent',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '2px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#333'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Highlight
            </button>
            <button
              onClick={handleLookUp}
              style={{
                background: 'transparent',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '2px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#333'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Look Up
            </button>
            <button
              onClick={clearSelection}
              style={{
                background: 'transparent',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '2px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#333'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ✕
            </button>
          </div>
        )}

        <div className="pages-left-div">
          <p className="pages-left">{page}</p>
        </div>
      </div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        chapters={chapters} 
        goToChapter={goToChapter} 
        handleRecap={handleRecap}
        highlights={highlights}
        lookUpText={lookUpText}
        selectedText={lookUpSelectedText}
        handleQA={handleQA}
        goToCfi={goToChapter}
      />
    </div>
  );
}

export default App;