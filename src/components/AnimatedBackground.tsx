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
    const speed = 0.02;
    const scale = 1.5;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Improved noise function for smoother patterns
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t * 0.5) * 0.5 + 0.5;
    };

    const animate = () => {
      if (!shouldAnimate) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = canvas;
      
      // Base gradient - light blue tones
      const baseGradient = ctx.createLinearGradient(0, 0, width, height);
      baseGradient.addColorStop(0, '#E0F2FE');    // blue-100
      baseGradient.addColorStop(0.5, '#DBEAFE');  // blue-100
      baseGradient.addColorStop(1, '#BFDBFE');    // blue-200
      
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      // Create flowing silk waves - MORE VISIBLE
      const step = 2;
      
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          const u = (x / width) * scale;
          const v = (y / height) * scale;
          
          const tOffset = time * speed;
          
          // Create flowing wave pattern
          const wave1 = Math.sin(u * 8 + tOffset) * Math.cos(v * 6 - tOffset * 0.7);
          const wave2 = Math.sin((u + v) * 4 + tOffset * 1.3) * 0.5;
          const wave3 = Math.cos(u * 3 - v * 5 + tOffset * 0.5) * 0.3;
          
          const combinedWave = (wave1 + wave2 + wave3) / 1.8;
          const intensity = (combinedWave + 1) / 2; // Normalize to 0-1
          
          // Add noise for texture
          const noiseVal = noise(x, y, tOffset);
          const finalIntensity = intensity * 0.7 + noiseVal * 0.3;
          
          // Much more visible blue tones
          const r = Math.floor(180 - finalIntensity * 80);   // 100-180
          const g = Math.floor(210 - finalIntensity * 60);   // 150-210
          const b = Math.floor(255 - finalIntensity * 30);   // 225-255
          const alpha = 0.4 + finalIntensity * 0.4;          // 0.4-0.8 opacity
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(x, y, step, step);
        }
      }

      // Add flowing highlight streaks
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 5; i++) {
        const yOffset = (height * 0.2) + (i * height * 0.15);
        const waveOffset = Math.sin(time * 0.01 + i) * 50;
        
        const streakGradient = ctx.createLinearGradient(0, yOffset + waveOffset, width, yOffset + waveOffset + 100);
        streakGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        streakGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.3)');
        streakGradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.5)');
        streakGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.3)');
        streakGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = streakGradient;
        ctx.beginPath();
        ctx.moveTo(0, yOffset + waveOffset);
        
        // Create wavy path
        for (let x = 0; x <= width; x += 20) {
          const waveY = yOffset + waveOffset + Math.sin(x * 0.01 + time * 0.02 + i) * 30;
          ctx.lineTo(x, waveY);
        }
        
        ctx.lineTo(width, yOffset + waveOffset + 150);
        ctx.lineTo(0, yOffset + waveOffset + 150);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Add subtle vignette for depth
      const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 1.3
      );
      vignetteGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      vignetteGradient.addColorStop(0.6, 'rgba(147, 197, 253, 0.05)');
      vignetteGradient.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
      
      ctx.fillStyle = vignetteGradient;
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
