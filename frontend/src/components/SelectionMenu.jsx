import React from 'react';

const SelectionMenu = ({ position, selectedText, onHighlight, onLookup, onClear }) => {
  if (!position || !selectedText) return null;

  const buttonStyle = {
    background: 'transparent',
    color: '#fff',
    border: 'none',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    borderRadius: '0.125rem'
  };

  const handleMouseEnter = (e) => e.target.style.background = '#333';
  const handleMouseLeave = (e) => e.target.style.background = 'transparent';

  return (
    <div 
      className="selection-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 50,
        transform: 'translateX(-50%)',
        background: '#000',
        color: '#fff',
        borderRadius: '0.25rem',
        padding: '0.5rem 0.75rem',
        boxShadow: '0 0.25rem 0.75rem rgba(0,0,0,0.4)', 
        zIndex: 1000,
        display: 'flex',
        gap: '0.75rem',
        fontSize: '0.875rem',
        border: '0.0625rem solid #333'
      }}
    >
      <button
        onClick={onHighlight}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Highlight
      </button>
      <button
        onClick={onLookup}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Look Up
      </button>
      <button
        onClick={onClear}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ✕
      </button>
    </div>
  );
};

export default SelectionMenu;