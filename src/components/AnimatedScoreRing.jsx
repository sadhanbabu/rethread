import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedScoreRing({ score, size = 64, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#333333"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Gold Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#goldScoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />

        <defs>
          <linearGradient id="goldScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A94A" />
            <stop offset="100%" stopColor="#C1502E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-black text-[#D4A94A] font-serif leading-none tracking-tight">{score}%</span>
        <span className="text-[7px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">MATCH</span>
      </div>
    </div>
  );
}
