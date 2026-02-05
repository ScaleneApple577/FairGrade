import React from "react";

const pulseKeyframes = `
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.5); opacity: 0.4; }
}

@keyframes shimmer-line {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.2; }
}

@keyframes floatUp {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  20% { opacity: 0.3; }
  80% { opacity: 0.3; }
  100% { transform: translateY(-20px) rotate(180deg); opacity: 0; }
}
`;

// Grid layout: 6 columns x 4 rows
const gridDots = [
  // Row 1
  { x: 10, y: 15, delay: 0 },
  { x: 26, y: 15, delay: 0.2 },
  { x: 42, y: 15, delay: 0.4 },
  { x: 58, y: 15, delay: 0.6 },
  { x: 74, y: 15, delay: 0.8 },
  { x: 90, y: 15, delay: 1.0 },
  // Row 2
  { x: 10, y: 38, delay: 0.3 },
  { x: 26, y: 38, delay: 0.5 },
  { x: 42, y: 38, delay: 0.7 },
  { x: 58, y: 38, delay: 0.9 },
  { x: 74, y: 38, delay: 1.1 },
  { x: 90, y: 38, delay: 1.3 },
  // Row 3
  { x: 10, y: 61, delay: 0.6 },
  { x: 26, y: 61, delay: 0.8 },
  { x: 42, y: 61, delay: 1.0 },
  { x: 58, y: 61, delay: 1.2 },
  { x: 74, y: 61, delay: 1.4 },
  { x: 90, y: 61, delay: 1.6 },
  // Row 4
  { x: 10, y: 84, delay: 0.9 },
  { x: 26, y: 84, delay: 1.1 },
  { x: 42, y: 84, delay: 1.3 },
  { x: 58, y: 84, delay: 1.5 },
  { x: 74, y: 84, delay: 1.7 },
  { x: 90, y: 84, delay: 1.9 },
];

// Connection lines (roughly 40% of adjacent connections)
const connectionLines = [
  // Horizontal connections
  { x1: 10, y1: 15, x2: 26, y2: 15, delay: 0.5 },
  { x1: 42, y1: 15, x2: 58, y2: 15, delay: 1.2 },
  { x1: 26, y1: 38, x2: 42, y2: 38, delay: 0.8 },
  { x1: 58, y1: 38, x2: 74, y2: 38, delay: 1.5 },
  { x1: 10, y1: 61, x2: 26, y2: 61, delay: 2.0 },
  { x1: 74, y1: 61, x2: 90, y2: 61, delay: 0.3 },
  { x1: 26, y1: 84, x2: 42, y2: 84, delay: 1.8 },
  { x1: 58, y1: 84, x2: 74, y2: 84, delay: 2.5 },
  // Vertical connections
  { x1: 26, y1: 15, x2: 26, y2: 38, delay: 1.0, vertical: true },
  { x1: 58, y1: 38, x2: 58, y2: 61, delay: 1.7, vertical: true },
  { x1: 74, y1: 15, x2: 74, y2: 38, delay: 2.2, vertical: true },
  { x1: 42, y1: 61, x2: 42, y2: 84, delay: 0.6, vertical: true },
  { x1: 90, y1: 38, x2: 90, y2: 61, delay: 1.4, vertical: true },
];

// Floating particles
const floatingParticles = [
  { left: 10, delay: 0 },
  { left: 25, delay: 1 },
  { left: 40, delay: 2 },
  { left: 55, delay: 3 },
  { left: 65, delay: 4 },
  { left: 75, delay: 5 },
  { left: 85, delay: 6 },
  { left: 90, delay: 7 },
];

const PulseGridBackground = () => {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <style>{pulseKeyframes}</style>
      
      {/* Pulsing grid dots */}
      {gridDots.map((dot, index) => (
        <div
          key={`dot-${index}`}
          className="absolute w-2 h-2 rounded-full bg-blue-400"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animation: `pulse-dot 3s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
      
      {/* Connection lines */}
      {connectionLines.map((line, index) => {
        const isVertical = line.vertical;
        const length = isVertical 
          ? Math.abs(line.y2 - line.y1) 
          : Math.abs(line.x2 - line.x1);
        
        return (
          <div
            key={`line-${index}`}
            className="absolute bg-blue-400/20"
            style={{
              left: `${Math.min(line.x1, line.x2)}%`,
              top: `${Math.min(line.y1, line.y2)}%`,
              width: isVertical ? '1px' : `${length}%`,
              height: isVertical ? `${length}%` : '1px',
              animation: `shimmer-line 4s ease-in-out infinite`,
              animationDelay: `${line.delay}s`,
            }}
          />
        );
      })}
      
      {/* Floating particles */}
      {floatingParticles.map((particle, index) => (
        <div
          key={`particle-${index}`}
          className="absolute w-1 h-1 bg-blue-300/20"
          style={{
            left: `${particle.left}%`,
            bottom: 0,
            animation: `floatUp 8s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default PulseGridBackground;
