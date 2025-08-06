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

const DEFAULT_FONT_SIZE = 32;

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const {
    renditionRef,
    chapters,
    currentPage,
    currentPageText,
    handleTocChanged,
    handleLocationChanged,
    handleGetRendition
  } = useReaderState();

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
    lookupText,
    lookupSelectedText,
    handleRecap,
    handleQA,
    handleLookup,
    handleHighlight
  } = useReaderActions(renditionRef, selectedText, addNewHighlight, clearSelection, toggleSidebar, currentPageText);

  const goToChapter = useCallback((cfi) => {
    setLocation(cfi);
  }, []);

  const updateTheme = (rendition) => {
    const themes = rendition.themes;
    
    if (isDarkMode) {
      themes.override('color', '#fff');
      themes.override('background', '#000');
    } else {
      themes.override('color', '#000');
      themes.override('background', '#fff');
    }
    
    themes.fontSize(`${(fontSize / 16) * 100}%`);
  };

  const createReaderTheme = () => {
    const baseTheme = {
      ...ReactReaderStyle,
      readerArea: {
        ...ReactReaderStyle.readerArea,
        transition: undefined,
      },
    };

    if (isDarkMode) {
      return {
        ...baseTheme,
        arrow: {
          ...ReactReaderStyle.arrow,
          color: 'white',
        },
        arrowHover: {
          ...ReactReaderStyle.arrowHover,
          color: '#ccc',
        },
        readerArea: {
          ...baseTheme.readerArea,
          backgroundColor: '#000000',
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
    }

    return baseTheme;
  };

  const onGetRendition = useCallback((rendition) => {
    handleGetRendition(rendition, applyHighlights, clearSelection);
    updateTheme(rendition);
  }, [handleGetRendition, applyHighlights, clearSelection, isDarkMode, fontSize]);

  useEffect(() => {
    if (renditionRef.current) {
      updateTheme(renditionRef.current);
    }
  }, [isDarkMode, fontSize]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
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
          readerStyles={createReaderTheme()}
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
        lookupText={lookupText}
        selectedText={lookupSelectedText}
        handleQA={handleQA}
        goToCfi={goToChapter}
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