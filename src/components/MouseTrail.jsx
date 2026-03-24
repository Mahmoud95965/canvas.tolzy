'use client';
import { useRef, useEffect } from 'react';

export default function MouseTrail({ color = '#ffffff' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let points = [];
    
    // Correctly measure parent and fill the whole space with fixed points
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      let newW = window.innerWidth;
      let newH = window.innerHeight;
      
      if (parent) {
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          newW = rect.width;
          newH = rect.height;
        }
      }
      
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW;
        canvas.height = newH;
        
        // Generate fixed points based on screen density to fill space entirely
        const newPoints = [];
        const numPoints = Math.floor((newW * newH) / 1200); // Ensures it's uniformly dense (~1500 dots on big screens)
        
        for (let i = 0; i < numPoints; i++) {
          newPoints.push({
            x: Math.random() * newW,
            y: Math.random() * newH,
            size: Math.random() * 1.5 + 0.5,
          });
        }
        points = newPoints;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    
    // Ensure parent DOM is fully rendered before measuring bounds
    setTimeout(resizeCanvas, 50);

    let mouse = { x: -1000, y: -1000 };
    let targetMouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Force initialization if resize was missed initially
      if (points.length === 0 && canvas.parentElement) {
        resizeCanvas();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse follow
      mouse.x += (targetMouse.x - mouse.x) * 0.15;
      mouse.y += (targetMouse.y - mouse.y) * 0.15;

      let r = 255, g = 255, b = 255;
      if (color.startsWith('#') && color.length === 7) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 400; // Giant flashlight radius
        
        let pointAlpha = 0.15; // Visible everywhere faintly
        let isNearMouse = false;

        if (dist < maxDist) {
          isNearMouse = true;
          const distFactor = (1 - (dist / maxDist));
          pointAlpha = Math.min(1, 0.15 + distFactor * 0.85); // Glows brightly when near
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pointAlpha})`;
        
        if (isNearMouse) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${pointAlpha})`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, 
        opacity: 1
      }}
    />
  );
}
