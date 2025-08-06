import React, { useState, useRef, useEffect } from 'react';
import { AiFillBackward, AiOutlineClose, AiOutlineBars, AiOutlineSetting } from "react-icons/ai";
import { BsHighlighter, BsMoon, BsSun } from "react-icons/bs";
import { BiMessageDots, BiSend, BiSearch, BiTrash, BiPlus, BiMinus } from "react-icons/bi";
import './Sidebar.css';

const MODES = {
  CONTENTS: 1,
  HIGHLIGHTS: 2,
  SETTINGS: 3,
  QA: 4,
  RECAP: 5,
  LOOKUP: 6
};

const FONT_LIMITS = { MIN: 10, MAX: 60, DEFAULT: 16, STEP: 2 };

function Sidebar({ 
  isOpen, 
  toggleSidebar, 
  chapters, 
  goToChapter, 
  handleRecap, 
  highlights, 
  lookupText, 
  selectedText, 
  handleQA, 
  goToCfi,
  deleteHighlight,
  isDarkMode,
  toggleDarkMode,
  fontSize,
  setFontSize
}) {
  const [currentMode, setCurrentMode] = useState(MODES.CONTENTS);
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [qaResponse, setQAResponse] = useState('');
  const [recapContent, setRecapContent] = useState('');
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) return;
    
    setCurrentMode(MODES.QA);
    setSubmittedQuestion(question);
    setQuestion('');
    setQAResponse('Loading...');
    
    try {
      const response = await handleQA(question);
      setQAResponse(response);
    } catch (error) {
      console.error('Error getting QA response:', error);
      setQAResponse('Sorry, there was an error processing your question. Please try again.');
    }
  };

  const loadRecap = async () => {
    setCurrentMode(MODES.RECAP);
    setRecapContent('Loading...');
    const recap = await handleRecap();
    setRecapContent(recap);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  };

  const adjustFontSize = (direction) => {
    const change = direction === 'increase' ? FONT_LIMITS.STEP : -FONT_LIMITS.STEP;
    setFontSize(prev => Math.max(FONT_LIMITS.MIN, Math.min(FONT_LIMITS.MAX, prev + change)));
  };

  const renderChapterList = () => (
    <ul>
      {chapters.map((item) => (
        <li key={item.id}>
          <button onClick={() => goToChapter(item.href)} className="chapter-button">
            {item.label}
          </button>
          {item.subitems?.length > 0 && (
            <ul className='subchapter-list'>
              {item.subitems.map((subitem) => (
                <li className='subchapter' key={subitem.id}>
                  <button onClick={() => goToChapter(subitem.href)} className="subchapter-button">
                    {subitem.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  const renderHighlightsList = () => (
    highlights.length === 0 ? (
      <p>No highlights yet.</p>
    ) : (
      <div className='highlight-div'>
        {highlights.map((highlight) => (
          <button 
            className='highlight-button' 
            key={highlight.id || highlight.cfi_range} 
            onClick={() => goToCfi(highlight.cfi_range)}
          >
            <div className='highlight-button-div'>
              <p className='highlight-text'>"{highlight.highlight_text || highlight.text}"</p>
              <button 
                className='delete-highlight-button' 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHighlight(highlight.id);
                }}
              >
                <BiTrash/>
              </button>
            </div>
          </button>
        ))}
      </div>
    )
  );

  const renderQASection = () => (
    submittedQuestion ? (
      <div>
        <div className='question-div'>
          <p>{submittedQuestion}</p>
        </div>
        <p className='recap-text'>{qaResponse}</p>
      </div>
    ) : (
      <div>
        <p className='recap-text'>Ask any question about the book, and I'll answer based on what you've read so far.</p>
      </div>
    )
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h3 className="settings-title">Settings</h3>
      
      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-text">Theme</span>
        </div>
        <button 
          className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
          onClick={toggleDarkMode}
        >
          <div className="theme-toggle-track">
            <div className="theme-toggle-thumb">
              {isDarkMode ? <BsMoon size={12} /> : <BsSun size={12} />}
            </div>
          </div>
          <span className="theme-label">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-label">
          <span className="setting-text">Font Size</span>
          <span className="font-size-display">{fontSize}px</span>
        </div>
        <div className="font-size-controls">
          <button 
            className="font-control-btn" 
            onClick={() => adjustFontSize('decrease')}
            disabled={fontSize <= FONT_LIMITS.MIN}
          >
            <BiMinus size={20} />
          </button>
          <button 
            className="font-control-btn" 
            onClick={() => adjustFontSize('increase')}
            disabled={fontSize >= FONT_LIMITS.MAX}
          >
            <BiPlus size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentMode) {
      case MODES.QA: return renderQASection();
      case MODES.RECAP: 
        return (
          <div className="recap">
            <p className='recap-title'>Recap</p>
            <p className='recap-text'>{recapContent}</p>
          </div>
        );
      case MODES.LOOKUP:
        return (
          <div className="recap">
            <p className='recap-title'>
              {selectedText ? `"${selectedText}"` : ''}
            </p>
            <p className='recap-text'>
              {lookupText || 'Select text and click "Look Up" to see definitions and explanations here.'}
            </p>
          </div>
        );
      case MODES.CONTENTS: return renderChapterList();
      case MODES.HIGHLIGHTS: return renderHighlightsList();
      case MODES.SETTINGS: return renderSettings();
      default: return <p>Select a tab.</p>;
    }
  };

  useEffect(() => {
    if (lookupText && lookupText !== '') {
      setCurrentMode(MODES.LOOKUP);
    }
  }, [lookupText]);

  useEffect(adjustTextareaHeight, [question]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className='top-sidebar'>
        <button className='library-button'>Library</button>
        <div className='top-right-sidebar'>
          <button 
            className={currentMode === MODES.QA ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => setCurrentMode(MODES.QA)}
          >
            <BiMessageDots />
          </button>
          <button 
            className={currentMode === MODES.RECAP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={loadRecap}
          >
            <AiFillBackward />
          </button>
          <button 
            className={currentMode === MODES.LOOKUP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => setCurrentMode(MODES.LOOKUP)}
          >
            <BiSearch />
          </button>
          <button className='top-right-button' onClick={toggleSidebar}>
            <AiOutlineClose />
          </button>
        </div>
      </div>

      <div className='inside-sidebar'>
        {renderContent()}
      </div>

      <div className='bottom-sidebar-searchbar'>
        {currentMode === MODES.QA && (
          <div className='bottom-sidebar-searchbar-send'>
            <textarea
              ref={textareaRef}
              className="qa-searchbar"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className='send-button' 
              onClick={submitQuestion}
              disabled={!question.trim()}
            >
              <BiSend size={'20px'} color='black' />
            </button>
          </div>
        )}

        <div className='bottom-sidebar'>
          <button 
            className={currentMode === MODES.CONTENTS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(MODES.CONTENTS)}
          >
            <AiOutlineBars className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Contents</p>
          </button>
          <button 
            className={currentMode === MODES.HIGHLIGHTS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(MODES.HIGHLIGHTS)}
          >
            <BsHighlighter className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Annotations</p>
          </button>
          <button 
            className={currentMode === MODES.SETTINGS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(MODES.SETTINGS)}
          >
            <AiOutlineSetting className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;