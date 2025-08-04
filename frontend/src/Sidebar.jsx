import './Sidebar.css';
import { AiFillBackward, AiOutlineClose, AiOutlineBars, AiOutlineSetting } from "react-icons/ai";
import { BsHighlighter } from "react-icons/bs";
import { BiMessageDots, BiSend, BiSearch } from "react-icons/bi";
import React, { useState, useRef, useEffect } from 'react';

function Sidebar({ isOpen, toggleSidebar, chapters, goToChapter, handleRecap, highlights, lookUpText, selectedText, handleQA, goToCfi }) {
  const [topBarButton, setTopBarButton] = useState(0);
  const [bottomBarButton, setBottomBarButton] = useState(1);
  const [question, setQuestion] = useState('');
  const [sentQuestion, setSentQuestion] = useState('');
  const textareaRef = useRef(null);
  const [recapText, setRecapText] = useState('')
  const [qaResponse, setQAResponse] = useState('')

  const sendQuestion = async () => {
    if (!question.trim()) return; // Don't send empty questions
    
    setTopBarButton(topBarButton == 1 ? 0 : 1);
    setSentQuestion(question);
    setQuestion('');
    setQAResponse('Loading...')
    
    try {
      const qaResponse = await handleQA(question);
      setQAResponse(qaResponse);
    } catch (error) {
      console.error('Error getting QA response:', error);
      setQAResponse('Sorry, there was an error processing your question. Please try again.');
    }
  }

  const onRecapClicked = async () => {
    setTopBarButton(topBarButton == 2 ? 0 : 2);
    setRecapText('Loading...');
    const recap = await handleRecap();
    setRecapText(recap);
  }

  // Auto-switch to lookup view when lookUpText changes (including 'Loading...')
  useEffect(() => {
    if (lookUpText && lookUpText !== '') {
      setTopBarButton(3); // Set to lookup mode (new mode)
    }
  }, [lookUpText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  // Handle Enter key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className='top-sidebar'>
        <button className='library-button'>Library</button>
        <div className='top-right-sidebar'>
          <button className={topBarButton === 1 ? 'top-right-button-selected' : 'top-right-button'} onClick={() => setTopBarButton(topBarButton === 1 ? 0 : 1)}><BiMessageDots /></button>
          <button className={topBarButton === 2 ? 'top-right-button-selected' : 'top-right-button'} onClick={onRecapClicked}><AiFillBackward /></button>
          <button className={topBarButton === 3 ? 'top-right-button-selected' : 'top-right-button'} onClick={() => setTopBarButton(topBarButton === 3 ? 0 : 3)}><BiSearch /></button>
          <button className='top-right-button' onClick={toggleSidebar}><AiOutlineClose /></button>
        </div>
      </div>

      <div className='inside-sidebar'>
  {topBarButton === 1 ? (
    // QA mode
    sentQuestion !== '' ? (
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
    )
  ) : topBarButton === 2 ? (
    // Recap mode
    <div className="recap">
      <p className='recap-title'>Recap</p>
      <p className='recap-text'>{recapText}</p>
    </div>
  ) : topBarButton === 3 ? (
    // Lookup mode
    <div className="recap">
      <p className='recap-title'>"{selectedText}"</p>
      <p className='recap-text'>{lookUpText || 'Select text and click "Look Up" to see definitions and explanations here.'}</p>
    </div>
  ) : (
    // Default view when topBarButton === 0
    bottomBarButton === 1 ? (
      // Contents (chapters)
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
    ) : bottomBarButton === 2 ? (
      // Annotations (highlights)
      highlights.length === 0 ? (
        <p>No highlights yet.</p>
      ) : (
        highlights.map((highlight) => (
          <button key={highlight.id || highlight.cfi_range} onClick={() => goToCfi(highlight.cfi_range)}>{highlight.highlight_text || highlight.text}</button>
        ))
      )
    ) : bottomBarButton === 3 ? (
      // Settings placeholder
      <p>Settings go here.</p>
    ) : (
      <p>Select a tab.</p>
    )
  )}
</div>


      <div className='bottom-sidebar-searchbar'>
        {topBarButton === 1 ? (
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
        ) : null}

        <div className='bottom-sidebar'>
          <button className={bottomBarButton === 1 && topBarButton === 0 ? 'bottom-button-selected' : 'bottom-button'} onClick={() => setBottomBarButton(1)}>
            <AiOutlineBars className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Contents</p>
          </button>
          <button className={bottomBarButton === 2 && topBarButton === 0 ? 'bottom-button-selected' : 'bottom-button'} onClick={() => setBottomBarButton(2)}>
            <BsHighlighter className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Annotations</p>
          </button>
          <button className={bottomBarButton === 3 && topBarButton === 0 ? 'bottom-button-selected' : 'bottom-button'} onClick={() => setBottomBarButton(3)}>
            <AiOutlineSetting className='bottom-buttons-icon' />
            <p className='bottom-buttons-text'>Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;