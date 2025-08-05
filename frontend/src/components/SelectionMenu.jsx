import React from 'react';

const SelectionMenu = ({ position, selectedText, onHighlight, onLookup, onClear }) => {
  if (!position || !selectedText) return null;

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
        onClick={onHighlight}
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
        onClick={onLookup}
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
        onClick={onClear}
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
  );
};

export default SelectionMenu;