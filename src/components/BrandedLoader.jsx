import React from 'react';
import { motion } from 'framer-motion';

export default function BrandedLoader({ text = 'LOADING...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing Outer Glow */}
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-[#C1502E]/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner Spinning Ring */}
        <motion.div
          className="w-10 h-10 border-2 border-t-[#C1502E] border-r-[#D4A94A] border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center Accent Dot */}
        <motion.div 
          className="absolute w-2.5 h-2.5 rounded-full bg-[#C1502E]"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {text && (
        <motion.p 
          className="editorial-label text-[10px] text-[#D4A94A] tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
