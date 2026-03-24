'use client';
import React, { useRef, useState, useEffect } from 'react';

export default function SpotlightContainer({ children, className = '', style = {}, spotlightColor = 'rgba(168,85,247,0.15)' }) {
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !spotlightRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Move slightly instantly but allow CSS transition for opacity
    spotlightRef.current.style.left = `${x}px`;
    spotlightRef.current.style.top = `${y}px`;
    spotlightRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-wrapper ${className}`}
      style={{
        position: 'relative',
        ...style
      }}
    >
      {/* Spotlight layer tracking mouse */}
      {isMounted && (
        <div 
          ref={spotlightRef}
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle closest-side, ${spotlightColor}, transparent)`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.6s ease',
            zIndex: 0
          }}
        />
      )}
      
      {/* Content Layer holding actual elements */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
