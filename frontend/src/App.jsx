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
  
  const {
    renditionRef,
    chapters,
    currentPage,
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition
  } = useReaderState();

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
  } = useReaderActions(renditionRef, selectedText, addNewHighlight, clearSelection);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const goToChapter = useCallback((cfi) => {
    setLocation(cfi);
  }, []);

  const onGetRendition = useCallback((rendition) => {
    handleGetRendition(rendition, applyHighlights, clearSelection);
  }, [handleGetRendition, applyHighlights, clearSelection]);

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
      />
    </div>
  );
}

export default App;