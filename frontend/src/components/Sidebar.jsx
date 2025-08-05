import React, { useState, useRef, useEffect } from 'react';
import { AiFillBackward, AiOutlineClose, AiOutlineBars, AiOutlineSetting } from "react-icons/ai";
import { BsHighlighter } from "react-icons/bs";
import { BiMessageDots, BiSend, BiSearch, BiTrash } from "react-icons/bi";
import './Sidebar.css';

const ButtonModes = {
  CONTENTS: 1,
  HIGHLIGHTS: 2,
  SETTINGS: 3,
  QA: 4,
  RECAP: 5,
  LOOKUP: 6
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
  const [currentMode, setCurrentMode] = useState(ButtonModes.CONTENTS);
  const [question, setQuestion] = useState('');
  const [sentQuestion, setSentQuestion] = useState('');
  const [qaResponse, setQAResponse] = useState('');
  const [recapText, setRecapText] = useState('');
  const textareaRef = useRef(null);

  const sendQuestion = async () => {
    if (!question.trim()) return;
    
    setCurrentMode(ButtonModes.QA);
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
    setCurrentMode(ButtonModes.RECAP);
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
      setCurrentMode(ButtonModes.LOOKUP);
    }
  }, [lookUpText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  const renderContent = () => {
    switch (currentMode) {
      case ButtonModes.QA:
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
      
      case ButtonModes.RECAP:
        return (
          <div className="recap">
            <p className='recap-title'>Recap</p>
            <p className='recap-text'>{recapText}</p>
          </div>
        );
      
      case ButtonModes.LOOKUP:
        return (
          <div className="recap">
            <p className='recap-title'>"{selectedText}"</p>
            <p className='recap-text'>{lookUpText || 'Select text and click "Look Up" to see definitions and explanations here.'}</p>
          </div>
        );

      case ButtonModes.CONTENTS:
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
      
      case ButtonModes.HIGHLIGHTS:
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
      
      case ButtonModes.SETTINGS:
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
            className={currentMode === ButtonModes.QA ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => setCurrentMode(ButtonModes.QA)}
          >
            <BiMessageDots />
          </button>
          <button 
            className={currentMode === ButtonModes.RECAP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={onRecapClicked}
          >
            <AiFillBackward />
          </button>
          <button 
            className={currentMode === ButtonModes.LOOKUP ? 'top-right-button-selected' : 'top-right-button'} 
            onClick={() => setCurrentMode(ButtonModes.LOOKUP)}
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
        {currentMode === ButtonModes.QA && (
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
            className={currentMode === ButtonModes.CONTENTS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(ButtonModes.CONTENTS)}
          >
            <AiOutlineBars className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Contents</p>
          </button>
          <button 
            className={currentMode === ButtonModes.HIGHLIGHTS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(ButtonModes.HIGHLIGHTS)}
          >
            <BsHighlighter className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Annotations</p>
          </button>
          <button 
            className={currentMode === ButtonModes.SETTINGS ? 'bottom-button-selected' : 'bottom-button'} 
            onClick={() => setCurrentMode(ButtonModes.SETTINGS)}
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