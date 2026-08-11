import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ParticleType = 'hearts' | 'sparkles' | 'confetti' | 'questionMarks' | 'sleepZ' | 'thoughtDots' | 'excitementLines' | 'impactLines' | 'tears';

interface ParticleEffectsProps {
  activeEffects: ParticleType[];
}

export const ParticleEffects: React.FC<ParticleEffectsProps> = ({ activeEffects }) => {
  // To handle re-triggering the same effect, we use keys based on render cycles,
  // but for simplicity we rely on Framer Motion AnimatePresence and state.
  return (
    <motion.g id="particle-effects-group" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {activeEffects.includes('hearts') && (
          <motion.g key="hearts-effect">
            {[
              { id: 1, x: 25, y: 65, scale: 1.2, rotate: -25, delay: 0 },
              { id: 2, x: 15, y: 125, scale: 0.8, rotate: -15, delay: 0.4 },
              { id: 3, x: 255, y: 70, scale: 1.0, rotate: 25, delay: 0.2 },
              { id: 4, x: 265, y: 135, scale: 0.7, rotate: 15, delay: 0.6 }
            ].map((h) => (
              <motion.path
                key={`heart-${h.id}`}
                d="M 0 5 A 5 5 0 0 1 10 -5 A 5 5 0 0 1 20 5 Q 20 15 10 25 Q 0 15 0 5 Z"
                fill="#FF4B72"
                style={{ originX: '50%', originY: '50%' }}
                initial={{ opacity: 0, y: h.y + 15, x: h.x, scale: 0, rotate: h.rotate }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  y: [h.y + 15, h.y, h.y - 10, h.y - 20],
                  scale: [0, h.scale, h.scale, h.scale * 1.1] 
                }}
                transition={{ duration: 2.5, delay: h.delay, repeat: Infinity, repeatDelay: 0.5 }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('sparkles') && (
          <motion.g key="sparkles-effect">
            {[1, 2, 3, 4].map((i) => {
              const dx = ((i * 43) % 100) - 50;
              const dy = ((i * 19) % 100) - 50;
              return (
                <motion.path
                  key={`sparkle-${i}`}
                  d="M 0 10 Q 5 5 10 0 Q 5 -5 0 -10 Q -5 -5 -10 0 Q -5 5 0 10 Z"
                  fill="#FFD700"
                  initial={{ opacity: 0, x: 150 + dx, y: 150 + dy, scale: 0, rotate: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 90, 180]
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              );
            })}
          </motion.g>
        )}

        {activeEffects.includes('confetti') && (
          <motion.g key="confetti-effect">
            {Array.from({ length: 12 }).map((_, i) => {
              const colors = ['#FF4B72', '#4DC0F0', '#FAD23C', '#07C2BB'];
              // Pseudo-random based on i
              const dx = ((i * 37) % 200) - 100;
              const dy = ((i * 59) % 150);
              const drot = (i * 73) % 360;
              return (
                <motion.rect
                  key={`confetti-${i}`}
                  width={8} height={12} rx={2}
                  fill={colors[i % colors.length]}
                  initial={{ opacity: 0, x: 150, y: 150, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    x: 150 + dx,
                    y: 150 - dy + 50,
                    rotate: drot,
                    scale: 1
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              );
            })}
          </motion.g>
        )}

        {activeEffects.includes('questionMarks') && (
          <motion.g key="question-effect">
            {[1, 2].map((i) => (
              <motion.text
                key={`q-${i}`}
                x={150 + (i === 1 ? -40 : 40)}
                y={60}
                fill="#FF4B72"
                fontSize="40"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                initial={{ opacity: 0, y: 80, scale: 0.5, rotate: i === 1 ? -15 : 15 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: 40,
                  scale: [0.5, 1.2, 1]
                }}
                transition={{ duration: 1.2, delay: i * 0.15 }}
              >
                ?
              </motion.text>
            ))}
          </motion.g>
        )}

        {activeEffects.includes('sleepZ') && (
          <motion.g key="sleep-effect">
            {[
              { id: 1, targetX: 230, targetY: 80, size: 20, delay: 0 },
              { id: 2, targetX: 250, targetY: 55, size: 26, delay: 0.8 },
              { id: 3, targetX: 270, targetY: 25, size: 34, delay: 1.6 }
            ].map((z) => (
              <motion.text
                key={`z-${z.id}`}
                x={z.targetX}
                y={z.targetY}
                fill="#4DC0F0"
                fontSize={z.size}
                fontWeight="bold"
                fontFamily='"Arial Rounded MT Bold", "Nunito", sans-serif'
                textAnchor="middle"
                style={{ originX: '50%', originY: '50%' }}
                initial={{ opacity: 0, x: z.targetX - 5, y: z.targetY + 15, scale: 0.5, rotate: 15 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: [z.targetX - 5, z.targetX, z.targetX + 3, z.targetX + 5],
                  y: [z.targetY + 15, z.targetY, z.targetY - 10, z.targetY - 20],
                  scale: [0.5, 1, 1, 1.1]
                }}
                transition={{ duration: 3.5, delay: z.delay, repeat: Infinity, repeatDelay: 0.5 }}
              >
                Z
              </motion.text>
            ))}
          </motion.g>
        )}

        {activeEffects.includes('thoughtDots') && (
          <motion.g key="thought-effect">
            <motion.path 
              d="M 190 70 Q 185 90 170 100 Q 185 95 190 70" 
              fill="#fff" stroke="#ddd" strokeWidth="2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.ellipse 
              cx="220" cy="50" rx="40" ry="25" 
              fill="#fff" stroke="#ddd" strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
            />
            {[1, 2, 3].map((i) => (
              <motion.circle
                key={`dot-${i}`}
                cx={195 + i * 12}
                cy={50}
                r={4}
                fill="#aaa"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, repeat: 0, delay: i * 0.2 }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('excitementLines') && (
          <motion.g key="excitement-effect">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.line
                key={`line-${angle}`}
                x1={150} y1={150}
                x2={150} y2={40}
                stroke="#FAD23C"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${angle} 150 150)`}
                initial={{ opacity: 0, strokeDasharray: "0 100", strokeDashoffset: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  strokeDasharray: ["0 100", "40 100", "0 100"],
                  strokeDashoffset: [0, -20, -60]
                }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </motion.g>
        )}
        
        {activeEffects.includes('impactLines') && (
          <motion.g key="impact-effect">
            {[0, 72, 144, 216, 288].map((angle) => (
              <motion.path
                key={`impact-${angle}`}
                d="M 150 150 L 145 90 L 150 80 L 155 90 Z"
                fill="#fff"
                transform={`rotate(${angle} 150 150)`}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1.5, 0] }}
                transition={{ duration: 0.4 }}
                style={{ originX: '150px', originY: '150px' }}
              />
            ))}
          </motion.g>
        )}

        {activeEffects.includes('tears') && (
          <motion.g key="tears-effect">
            {[1, 2].map((i) => (
              <motion.path
                key={`tear-${i}`}
                d="M 0 0 C -5 5 -5 10 0 12 C 5 10 5 5 0 0 Z"
                fill="#4DC0F0"
                initial={{ opacity: 0, x: i === 1 ? 115 : 185, y: 150, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [150, 180, 200],
                  scale: [0, 1.2, 1.5, 0.5]
                }}
                transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity, repeatDelay: 0.2 }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
};
