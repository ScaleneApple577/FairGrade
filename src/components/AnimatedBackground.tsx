import React, { useEffect, useRef, useState } from 'react';

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setShouldAnimate(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const speed = 0.015;
    const scale = 2;
    const noiseIntensity = 0.6;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple noise function
    const noise = (x: number, y: number) => {
      const G = 2.71828;
      const rx = G * Math.sin(G * x);
      const ry = G * Math.sin(G * y);
      return (rx * ry * (1 + x)) % 1;
    };

    const animate = () => {
      if (!shouldAnimate) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = canvas;
      
      // Create gradient background (FairGrade blue tones)
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#EFF6FF');    // blue-50
      gradient.addColorStop(0.3, '#DBEAFE');  // blue-100
      gradient.addColorStop(0.6, '#EFF6FF');  // blue-50
      gradient.addColorStop(1, '#DBEAFE');    // blue-100
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Create silk-like pattern with larger step for performance
      const step = 3;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          const u = (x / width) * scale;
          const v = (y / height) * scale;
          
          const tOffset = speed * time;
          const tex_x = u;
          const tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

          const pattern = 0.6 + 0.4 * Math.sin(
            5.0 * (tex_x + tex_y + 
              Math.cos(3.0 * tex_x + 5.0 * tex_y) + 
              0.02 * tOffset) +
            Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
          );

          const rnd = noise(x, y);
          const intensity = Math.max(0, pattern - rnd / 15.0 * noiseIntensity);
          
          // FairGrade blue color - subtle silk effect
          const alpha = 0.03 + (0.08 * intensity);
          
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.fillRect(x, y, step, step);
        }
      }

      // Add subtle radial overlay for depth
      const overlayGradient = ctx.createRadialGradient(
        width / 2, height / 4, 0,
        width / 2, height / 4, Math.max(width, height) / 1.2
      );
      overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      overlayGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      overlayGradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shouldAnimate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1
      }}
    />
  );
};
