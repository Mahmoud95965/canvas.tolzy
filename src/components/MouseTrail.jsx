'use client';
import { useRef, useEffect } from 'react';

export default function MouseTrail({ color = '#ffffff' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Resize to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 0);

    // Initialize scattered points
    const points = [];
    const numPoints = 800; // Massive points to fill the screen

    let mouse = { x: -1000, y: -1000 };
    let targetMouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lazily initialize points once canvas has bound dimensions
      if (points.length === 0 && canvas.width > 0) {
        for (let i = 0; i < numPoints; i++) {
          points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5, // Reduced size for subtlety
            vx: (Math.random() - 0.5) * 0.15, // Slower movement
            vy: (Math.random() - 0.5) * 0.15,
          });
        }
      }

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

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 500; // Huge flashlight radius to fill more space
        
        let pointAlpha = 0.3; // Visibly fills the screen faintly
        let isNearMouse = false;

        if (dist < maxDist) {
          isNearMouse = true;
          const distFactor = (1 - (dist / maxDist));
          pointAlpha = Math.min(1, 0.3 + distFactor * 0.7); // Glows brightly when near
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
        zIndex: 5, /* Placed slightly above grid but seamlessly in background */
        opacity: 1
      }}
    />
  );
}
