"use client"

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Particle {
  id: number;
  path: { x: number; y: number }[];
  size: number;
}

export function ParticleTransition({ onComplete }: { onComplete: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Generate particles with many waypoints for smooth continuous movement
    const newParticles: Particle[] = [];
    for (let i = 0; i < 360; i++) {
      const path = [];
      const shouldConverge = i < 250; // 75% converge to top-left, 25% stay floating
      
      // Starting position
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      path.push({ x: startX, y: startY });
      
      // Slow floating movement - small incremental changes
      let currentX = startX;
      let currentY = startY;
      
      // Add 10 waypoints with small movements for slow floating (0.8s - 2.2s)
      for (let j = 0; j < 10; j++) {
        // Move only 5-15% of screen size per waypoint for slow movement
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
        // Define target position within message bounds
        const messageWidth = 250;
        const messageHeight = 50;
        const targetX = Math.random() * messageWidth;
        const targetY = Math.random() * messageHeight;
        
        // Create varied curved paths to the target position
        const pathType = Math.random();
        const numConvergePoints = 15; // More points for smoother movement
        
        if (pathType < 0.33) {
          // Curved path through top-right
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            // Interpolate toward target with curve
            const curveX = currentX + (width * 0.3 - currentX) * Math.sin(progress * Math.PI / 2);
            const curveY = currentY * (1 - progress * 0.7);
            currentX = curveX * (1 - progress) + targetX * progress;
            currentY = curveY * (1 - progress) + targetY * progress;
            path.push({ x: currentX, y: currentY });
          }
        } else if (pathType < 0.66) {
          // Curved path through left side
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            const curveX = currentX * (1 - progress * 0.7);
            const curveY = currentY + (height * 0.2 - currentY) * Math.sin(progress * Math.PI / 2) * (1 - progress);
            currentX = curveX * (1 - progress) + targetX * progress;
            currentY = curveY * (1 - progress) + targetY * progress;
            path.push({ x: currentX, y: currentY });
          }
        } else {
          // Smooth curved path with random variations
          for (let j = 0; j < numConvergePoints; j++) {
            const progress = (j + 1) / (numConvergePoints + 1);
            // Gradually move toward target with some curve
            const randomOffsetX = (Math.random() - 0.5) * width * 0.05 * (1 - progress);
            const randomOffsetY = (Math.random() - 0.5) * height * 0.05 * (1 - progress);
            currentX = currentX * (1 - progress) + targetX * progress + randomOffsetX;
            currentY = currentY * (1 - progress) + targetY * progress + randomOffsetY;
            path.push({ x: currentX, y: currentY });
          }
        }
        
        // Final position at target
        path.push({ x: targetX, y: targetY });
      } else {
        // Continue floating randomly (2.2s - 3s)
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
        
        // Stay at current position (will fade out)
        path.push({ x: currentX, y: currentY });
      }
      
      newParticles.push({
        id: i,
        path,
        size: Math.random() * 5 + 2,
      });
    }
    setParticles(newParticles);

    // Complete at 2.3s (particles will still be fading)
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
        
        // Create evenly distributed time points for smooth movement
        const numPoints = particle.path.length;
        const times = Array.from({ length: numPoints }, (_, i) => i / (numPoints - 1));
        
        // Opacity: fade in at start, stay visible, fade out at end
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
