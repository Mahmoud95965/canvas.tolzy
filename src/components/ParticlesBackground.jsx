'use client';
import { useRef, useEffect } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const numParticles = 800;
    
    // Smooth mouse position for parallax
    let mouse = { x: width / 2, y: height / 2 };
    let targetMouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Initialize particles (3D Sphere shell)
    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      // Make them mostly on the surface of a sphere, some slightly inside
      const radius = (Math.min(width, height) * 0.45) * (0.8 + Math.random() * 0.2);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        x0: x,
        y0: y,
        z0: z,
        baseSize: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.4 ? '#4f46e5' : '#8b5cf6', // Indigo to Purple mix
      });
    }

    let time = 0;

    const render = () => {
      time += 0.001;
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse for smooth parallax
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      const mouseXOffset = (mouse.x - width / 2) * 0.001;
      const mouseYOffset = (mouse.y - height / 2) * 0.001;

      // Base rotation + mouse parallax influence
      const rotX = time * 2 + mouseYOffset;
      const rotY = time + mouseXOffset;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // 3D rotation around X axis
        const y1 = p.y0 * cosX - p.z0 * sinX;
        const z1 = p.y0 * sinX + p.z0 * cosX;

        // 3D rotation around Y axis
        const x2 = p.x0 * cosY + z1 * sinY;
        const z2 = -p.x0 * sinY + z1 * cosY;

        // Perspective projection
        const focalLength = 400;
        const scale = focalLength / (focalLength + z2 + 200); 

        const drawX = width / 2 + x2 * scale;
        const drawY = height / 2 + y1 * scale;

        // Draw if it's not too far behind the camera
        if (z2 > -focalLength + 50) {
          // Fade based on depth
          const depthAlpha = Math.max(0, Math.min(1, scale * 1.5 - 0.5));
          
          if (depthAlpha > 0.05) { // Optimization skip invisible
            // Mouse interaction: draw lines if mouse is close
            const dx = targetMouse.x - drawX;
            const dy = targetMouse.y - drawY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let alpha = depthAlpha;

            ctx.beginPath();
            if (dist < 120) {
              // Particle glows when mouse is near
              ctx.arc(drawX, drawY, p.baseSize * scale * 2, 0, Math.PI * 2);
              alpha = Math.min(1, depthAlpha + 0.5);
              
              // Draw connection line to mouse
              ctx.moveTo(drawX, drawY);
              ctx.lineTo(targetMouse.x, targetMouse.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist/120) * 0.3 * depthAlpha})`;
              ctx.stroke();
            } else {
              // Draw as an elongated dash along its movement vector or just a dot
              ctx.arc(drawX, drawY, p.baseSize * scale, 0, Math.PI * 2);
            }
            
            // Hex color to rgba
            const r = parseInt(p.color.slice(1, 3), 16);
            const g = parseInt(p.color.slice(3, 5), 16);
            const b = parseInt(p.color.slice(5, 7), 16);
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        opacity: 0.9
      }}
    />
  );
}
