import React, { useState, useCallback } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { ReactReader } from 'react-reader';
import '@fontsource-variable/open-sans';

import Sidebar from './components/Sidebar';
import SelectionMenu from './components/SelectionMenu';
import { useReaderState } from './hooks/useReaderState';
import { useHighlights } from './hooks/useHighlights';
import { useTextSelection } from './hooks/useTextSelection';
import { useReaderActions } from './hooks/useReaderActions';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useState(0);
  // Add state for current page text in App component
  const [currentPageText, setCurrentPageText] = useState('');

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const {
    renditionRef,
    chapters,
    currentPage,
    currentPageText: hookPageText, // Get the page text from hook
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition
  } = useReaderState();

  // Update App's state when hook's page text changes
  React.useEffect(() => {
    if (hookPageText !== currentPageText) {
      setCurrentPageText(hookPageText);
      console.log('App.jsx - Page text updated:', {
        length: hookPageText.length,
        preview: hookPageText.substring(0, 100) + '...'
      });
    }
  }, [hookPageText, currentPageText]);

  const {
    highlights,
    applyHighlights,
    addNewHighlight
  } = useHighlights(renditionRef, location);

  const {
    selectedText,
    selectionMenuPosition,
    clearSelection
  } = useTextSelection(renditionRef);

  const {
    lookUpText,
    lookUpSelectedText,
    handleRecap,
    handleQA,
    handleLookup,
    handleHighlight
  } = useReaderActions(renditionRef, selectedText, addNewHighlight, clearSelection, toggleSidebar, currentPageText);

  const goToChapter = useCallback((cfi) => {
    setLocation(cfi);
  }, []);

  const onGetRendition = useCallback((rendition) => {
    handleGetRendition(rendition, applyHighlights, clearSelection);
  }, [handleGetRendition, applyHighlights, clearSelection]);

  // Example function to demonstrate using the current page text
  const handleAnalyzeCurrentPage = useCallback(() => {
    if (currentPageText) {
      console.log('Analyzing current page text:', {
        wordCount: currentPageText.split(' ').length,
        charCount: currentPageText.length,
        text: currentPageText
      });
      // You can now use currentPageText for AI analysis, summarization, etc.
    }
  }, [currentPageText]);

  return (
    <div className="app-container">
      <div className={`main-content ${isSidebarOpen ? 'pushed' : ''}`} style={{ height: '100vh' }}>
        <button onClick={toggleSidebar} className="menu-button">
          <AiOutlineMenu />
        </button>
        
        <ReactReader
          url={process.env.PUBLIC_URL + '/A_Court_of_Wings_and_Ruin_by_Sarah_J_Maas.epub'}
          location={location}
          locationChanged={handleLocationChanged}
          showToc={false}
          epubOptions={{ 
            spread: 'none', 
            allowPopups: true, 
            allowScriptedContent: true 
          }}
          swipeable={false}
          getRendition={onGetRendition}
          tocChanged={handleTocChanged}
        />
        
        <SelectionMenu
          position={selectionMenuPosition}
          selectedText={selectedText}
          onHighlight={handleHighlight}
          onLookup={handleLookup}
          onClear={clearSelection}
        />

        <div className="pages-left-div">
          <p className="pages-left">{currentPage}</p>
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
        currentPageText={currentPageText}
      />
    </div>
  );
}

export default App;