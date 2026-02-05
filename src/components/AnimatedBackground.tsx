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
      canvas.height = window.innerHeight;
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
      gradient.addColorStop(0.5, '#DBEAFE');  // blue-100
      gradient.addColorStop(1, '#BFDBFE');    // blue-200
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Create silk-like pattern
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
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
          
          // FairGrade blue color (#3B82F6 = rgb(59, 130, 246))
          const r = Math.floor(59 + (196 * (1 - intensity * 0.3)));
          const g = Math.floor(130 + (125 * (1 - intensity * 0.3)));
          const b = Math.floor(246 + (9 * (1 - intensity * 0.3)));
          const a = Math.floor(20 + (50 * intensity));

          const index = (y * width + x) * 4;
          if (index < data.length) {
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add subtle blue overlay for depth
      const overlayGradient = ctx.createRadialGradient(
        width / 2, height / 3, 0,
        width / 2, height / 3, Math.max(width, height) / 1.5
      );
      overlayGradient.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
      overlayGradient.addColorStop(1, 'rgba(59, 130, 246, 0.08)');
      
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
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    />
  );
};
