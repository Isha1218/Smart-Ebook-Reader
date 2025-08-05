import React, { useState, useRef, useEffect } from 'react';
import { AiFillBackward, AiOutlineClose, AiOutlineBars, AiOutlineSetting } from "react-icons/ai";
import { BsHighlighter } from "react-icons/bs";
import { BiMessageDots, BiSend, BiSearch, BiTrash } from "react-icons/bi";
import './Sidebar.css';

const TopBarModes = {
  DEFAULT: 0,
  QA: 1,
  RECAP: 2,
  LOOKUP: 3
};

const BottomBarModes = {
  CONTENTS: 1,
  HIGHLIGHTS: 2,
  SETTINGS: 3
};

function Sidebar({ 
  isOpen, 
  toggleSidebar, 
  chapters, 
  goToChapter, 
  handleRecap, 
  highlights, 
  lookUpText, 
  selectedText, 
  handleQA, 
  goToCfi 
}) {
  const [topBarMode, setTopBarMode] = useState(TopBarModes.DEFAULT);
  const [bottomBarMode, setBottomBarMode] = useState(BottomBarModes.CONTENTS);
  const [question, setQuestion] = useState('');
  const [sentQuestion, setSentQuestion] = useState('');
  const [qaResponse, setQAResponse] = useState('');
  const [recapText, setRecapText] = useState('');
  const textareaRef = useRef(null);

  const toggleTopBarMode = (mode) => {
    setTopBarMode(topBarMode === mode ? TopBarModes.DEFAULT : mode);
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;
    
    setTopBarMode(topBarMode === TopBarModes.QA ? TopBarModes.DEFAULT : TopBarModes.QA);
    setSentQuestion(question);
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

  const onRecapClicked = async () => {
    setTopBarMode(topBarMode === TopBarModes.RECAP ? TopBarModes.DEFAULT : TopBarModes.RECAP);
    setRecapText('Loading...');
    const recap = await handleRecap();
    setRecapText(recap);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  useEffect(() => {
    if (lookUpText && lookUpText !== '') {
      setTopBarMode(TopBarModes.LOOKUP);
    }
  }, [lookUpText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  const renderTopBarContent = () => {
    switch (topBarMode) {
      case TopBarModes.QA:
        return sentQuestion !== '' ? (
          <div>
            <div className='question-div'>
              <p>{sentQuestion}</p>
            </div>
            <p className='recap-text'>{qaResponse}</p>
          </div>
        ) : (
          <div>
            <p className='recap-text'>Ask any question about the book, and I'll answer based on what you've read so far.</p>
          </div>
        );
      
      case TopBarModes.RECAP:
        return (
          <div className="recap">
            <p className='recap-title'>Recap</p>
            <p className='recap-text'>{recapText}</p>
          </div>
        );
      
      case TopBarModes.LOOKUP:
        return (
          <div className="recap">
            <p className='recap-title'>"{selectedText}"</p>
            <p className='recap-text'>{lookUpText || 'Select text and click "Look Up" to see definitions and explanations here.'}</p>
          </div>
        );
      
      default:
        return renderBottomBarContent();
    }
  };

  const renderBottomBarContent = () => {
    switch (bottomBarMode) {
      case BottomBarModes.CONTENTS:
        return (
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
      
      case BottomBarModes.HIGHLIGHTS:
        return highlights.length === 0 ? (
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
                  <BiTrash/>
                </div>
              </button>
            ))}
          </div>
        );
      
      case BottomBarModes.SETTINGS:
        return <p>Settings go here.</p>;
      
      default:
        return <p>Select a tab.</p>;
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className='top-sidebar'>
        <button className='library-button'>Library</button>
        <div className='top-right-sidebar'>
          <button 
            className={topBarMode === TopBarModes.QA ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => toggleTopBarMode(TopBarModes.QA)}
          >
            <BiMessageDots />
          </button>
          <button 
            className={topBarMode === TopBarModes.RECAP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={onRecapClicked}
          >
            <AiFillBackward />
          </button>
          <button 
            className={topBarMode === TopBarModes.LOOKUP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => toggleTopBarMode(TopBarModes.LOOKUP)}
          >
            <BiSearch />
          </button>
          <button className='top-right-button' onClick={toggleSidebar}>
            <AiOutlineClose />
          </button>
        </div>
      </div>

      <div className='inside-sidebar'>
        {renderTopBarContent()}
      </div>

      <div className='bottom-sidebar-searchbar'>
        {topBarMode === TopBarModes.QA && (
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
              onClick={sendQuestion}
              disabled={!question.trim()}
            >
              <BiSend size={'20px'} color='black' />
            </button>
          </div>
        )}

        <div className='bottom-sidebar'>
          <button 
            className={bottomBarMode === BottomBarModes.CONTENTS && topBarMode === TopBarModes.DEFAULT ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setBottomBarMode(BottomBarModes.CONTENTS)}
          >
            <AiOutlineBars className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Contents</p>
          </button>
          <button 
            className={bottomBarMode === BottomBarModes.HIGHLIGHTS && topBarMode === TopBarModes.DEFAULT ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setBottomBarMode(BottomBarModes.HIGHLIGHTS)}
          >
            <BsHighlighter className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Annotations</p>
          </button>
          <button 
            className={bottomBarMode === BottomBarModes.SETTINGS && topBarMode === TopBarModes.DEFAULT ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setBottomBarMode(BottomBarModes.SETTINGS)}
          >
            <AiOutlineSetting className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;