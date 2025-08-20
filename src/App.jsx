import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const CCTVLayoutEditor = () => {
  const canvasRef = useRef(null);
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState('cctv');
  const [hoveredItem, setHoveredItem] = useState(null);

  // Item types with their properties
  const itemTypes = {
    cctv: { 
      icon: '📹', 
      label: 'CCTV Camera',
      color: '#ff6b6b',
      size: 30
    },
    person: { 
      icon: '👤', 
      label: 'Person',
      color: '#4ecdc4',
      size: 25
    },
    box: { 
      icon: '📦', 
      label: 'Box',
      color: '#45b7d1',
      size: 25
    },
    laptop: { 
      icon: '💻', 
      label: 'Laptop',
      color: '#96ceb4',
      size: 25
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCanvasClick = (e) => {
    if (draggedItem) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on existing item
    const clickedItem = items.find(item => {
      const dx = x - item.x;
      const dy = y - item.y;
      const size = itemTypes[item.type].size;
      return Math.sqrt(dx * dx + dy * dy) < size / 2;
    });

    if (clickedItem) {
      // Remove item on click (with animation effect)
      setItems(items.filter(item => item.id !== clickedItem.id));
      return;
    }

    // Add new item
    const newItem = {
      id: generateId(),
      type: selectedTool,
      x: x,
      y: y,
      placed: true
    };

    setItems([...items, newItem]);
  };

  const handleMouseDown = (e, item) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggedItem(item);
    setDragOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedItem) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Keep items within canvas bounds
    const size = itemTypes[draggedItem.type].size;
    const boundedX = Math.max(size/2, Math.min(800 - size/2, newX));
    const boundedY = Math.max(size/2, Math.min(600 - size/2, newY));

    setItems(items.map(item => 
      item.id === draggedItem.id 
        ? { ...item, x: boundedX, y: boundedY }
        : item
    ));
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedItem, dragOffset, items]);

  const clearCanvas = () => {
    setItems([]);
  };

  const getItemCount = (type) => {
    return items.filter(item => item.type === type).length;
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <h1 className="app-title">
          🎮 Interactive CCTV Layout Editor
        </h1>

        {/* Tool Selection */}
        <div className="tool-selection">
          {Object.entries(itemTypes).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedTool(type)}
              className={`tool-button ${selectedTool === type ? 'tool-button-selected' : ''}`}
            >
              {config.icon} {config.label} ({getItemCount(type)})
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="instructions">
          <p className="instructions-title">
            🎯 How to Use:
          </p>
          <p className="instructions-text">
            <strong>Click</strong> on canvas to place items • <strong>Drag</strong> items to move them • <strong>Click</strong> on items to remove them
          </p>
        </div>

        {/* Canvas */}
        <div className="canvas-container">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="canvas"
          >
          
            {items.map((item) => {
              const config = itemTypes[item.type];
              const isDragging = draggedItem && draggedItem.id === item.id;
              const isHovered = hoveredItem === item.id;
              
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`canvas-item ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{
                    left: item.x - config.size / 2,
                    top: item.y - config.size / 2,
                    width: config.size,
                    height: config.size,
                    fontSize: config.size * 0.8,
                    borderColor: config.color,
                    backgroundColor: isHovered || isDragging ? config.color : 'rgba(255,255,255,0.9)',
                    boxShadow: isDragging ? `0 10px 30px ${config.color}40` : isHovered ? `0 5px 20px ${config.color}30` : `0 2px 10px ${config.color}20`,
                  }}
                >
                
                  {config.icon}
                </div>
              );
            })}

            {/* Grid overlay for better visual guidance */}
            <div className="grid-overlay" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={clearCanvas}
            className="clear-button"
          >
            🗑️ Clear Canvas
          </button>
          
          <div className="stats-display">
            📊 Total Items: {items.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTVLayoutEditor;