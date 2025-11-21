"use client"

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Particle {
  id: number;
  path: { x: number; y: number }[];
  size: number;
}

// Animated particle effect that converges into chat messages
export function ParticleTransition({ onComplete }: { onComplete: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 360; i++) {
      const path = [];
      const shouldConverge = i < 300;
      
      // Starting position
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      path.push({ x: startX, y: startY });
      
      let currentX = startX;
      let currentY = startY;
      
      for (let j = 0; j < 10; j++) {
        const deltaX = (Math.random() - 0.5) * width * 0.15;
        const deltaY = (Math.random() - 0.5) * height * 0.15;
        currentX = Math.max(0, Math.min(width, currentX + deltaX));
        currentY = Math.max(0, Math.min(height, currentY + deltaY));
        path.push({
          x: currentX,
          y: currentY,
        });
      }
      
      if (shouldConverge) {
        const messageWidth = 250;
        const messageHeight = 50;
        const targetX = Math.random() * messageWidth;
        const targetY = Math.random() * messageHeight;
        
        const pathType = Math.random();
        const numConvergePoints = 15;
        
        if (pathType < 0.33) {
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            const curveX = currentX + (width * 0.3 - currentX) * Math.sin(progress * Math.PI / 2);
            const curveY = currentY * (1 - progress * 0.7);
            currentX = curveX * (1 - progress) + targetX * progress;
            currentY = curveY * (1 - progress) + targetY * progress;
            path.push({ x: currentX, y: currentY });
          }
        } else if (pathType < 0.66) {
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            const curveX = currentX * (1 - progress * 0.7);
            const curveY = currentY + (height * 0.2 - currentY) * Math.sin(progress * Math.PI / 2) * (1 - progress);
            currentX = curveX * (1 - progress) + targetX * progress;
            currentY = curveY * (1 - progress) + targetY * progress;
            path.push({ x: currentX, y: currentY });
          }
        } else {
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            const randomOffsetX = (Math.random() - 0.5) * width * 0.05 * (1 - progress);
            const randomOffsetY = (Math.random() - 0.5) * height * 0.05 * (1 - progress);
            currentX = currentX * (1 - progress) + targetX * progress + randomOffsetX;
            currentY = currentY * (1 - progress) + targetY * progress + randomOffsetY;
            path.push({ x: currentX, y: currentY });
          }
        }
        
        path.push({ x: targetX, y: targetY });
      } else {
        for (let j = 0; j < 8; j++) {
          const deltaX = (Math.random() - 0.5) * width * 0.15;
          const deltaY = (Math.random() - 0.5) * height * 0.15;
          currentX = Math.max(0, Math.min(width, currentX + deltaX));
          currentY = Math.max(0, Math.min(height, currentY + deltaY));
          path.push({
            x: currentX,
            y: currentY,
          });
        }
        
        path.push({ x: currentX, y: currentY });
      }
      
      newParticles.push({
        id: i,
        path,
        size: Math.random() * 5 + 2,
      });
    }
    setParticles(newParticles);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => {
        const xPath = particle.path.map(p => p.x);
        const yPath = particle.path.map(p => p.y);
        
        const numPoints = particle.path.length;
        const times = Array.from({ length: numPoints }, (_, i) => i / (numPoints - 1));
        
        const opacityValues = particle.path.map((_, i) => {
          if (i === 0) return 0;
          if (i < 2) return 1;
          if (i >= numPoints - 2) return 0;
          return 1;
        });
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-black"
            style={{
              width: particle.size,
              height: particle.size,
              left: 0,
              top: 0,
            }}
            initial={{
              x: xPath[0],
              y: yPath[0],
              opacity: 0,
            }}
            animate={{
              x: xPath,
              y: yPath,
              opacity: opacityValues,
            }}
            transition={{
              duration: 3,
              times: times,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
