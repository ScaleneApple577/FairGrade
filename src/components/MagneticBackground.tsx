import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MagneticBackgroundProps {
  particleCount?: number;
  containerRect: DOMRect | null;
  targetRect: TargetRect | null;
}

export function MagneticBackground({
  particleCount = 40,
  containerRect,
  targetRect,
}: MagneticBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, [particleCount]);

  if (!containerRect) {
    return null;
  }

  const radius = 300;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {particles.map((particle) => {
        const baseX = (particle.x / 100) * containerRect.width;
        const baseY = (particle.y / 100) * containerRect.height;

        let animate = { x: 0, y: 0, opacity: 0.5 };

        if (targetRect) {
          const cx = targetRect.x + targetRect.width / 2;
          const cy = targetRect.y + targetRect.height / 2;

          const dx = baseX - cx;
          const dy = baseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius && dist > 0) {
            const factor = 0.6;
            const targetX = cx + dx * factor;
            const targetY = cy + dy * factor;

            animate = {
              x: targetX - baseX,
              y: targetY - baseY,
              opacity: 0.9,
            };
          }
        }

        const hasTarget = !!targetRect;

        return (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-blue-500"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={false}
            animate={animate}
            transition={{
              type: "spring",
              stiffness: hasTarget ? 50 : 100,
              damping: hasTarget ? 10 : 15,
              mass: 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

