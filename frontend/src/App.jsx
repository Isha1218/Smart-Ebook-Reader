import React, { useEffect, useState, useCallback } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { ReactReader, ReactReaderStyle } from 'react-reader';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(32);
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
    addNewHighlight,
    deleteExistingHighlight
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateTheme = (rendition) => {
    const themes = rendition.themes
    if (isDarkMode) {
        themes.override('color', '#fff')
        themes.override('background', '#000')
    } else {
        themes.override('color', '#000')
        themes.override('background', '#fff')
    }
    // Apply font size
    themes.fontSize(`${(fontSize / 16) * 100}%`)
  }

  // Reader theme styles
  const lightReaderTheme = {
    ...ReactReaderStyle,
    readerArea: {
      ...ReactReaderStyle.readerArea,
      transition: undefined,
    },
  };

  const darkReaderTheme = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      color: 'white',
    },
    arrowHover: {
      ...ReactReaderStyle.arrowHover,
      color: '#ccc',
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      backgroundColor: '#1a1a1a',
      transition: undefined,
    },
    titleArea: {
      ...ReactReaderStyle.titleArea,
      color: '#ccc',
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      background: '#2d2d2d',
    },
    tocButtonExpanded: {
      ...ReactReaderStyle.tocButtonExpanded,
      background: '#4a4a4a',
    },
    tocButtonBar: {
      ...ReactReaderStyle.tocButtonBar,
      background: '#fff',
    },
    tocButton: {
      ...ReactReaderStyle.tocButton,
      color: 'white',
    },
  };

  const onGetRendition = useCallback((rendition) => {
    handleGetRendition(rendition, applyHighlights, clearSelection);
    updateTheme(rendition)
  }, [handleGetRendition, applyHighlights, clearSelection, isDarkMode, fontSize]);

  useEffect(() => {
    if (renditionRef.current) {
      updateTheme(renditionRef.current)
    }
  }, [isDarkMode, fontSize])

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
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
          readerStyles={isDarkMode ? darkReaderTheme : lightReaderTheme}
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
        deleteHighlight={deleteExistingHighlight}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
    </div>
  );
}

export default App;