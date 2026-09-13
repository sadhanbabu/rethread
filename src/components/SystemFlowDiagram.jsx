import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Award, CheckCircle2, HeartHandshake, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Donor Uploads',
    desc: 'Garment specs, photo & pickup location',
    icon: Upload,
    color: 'from-[#C1502E] to-[#A33F21]'
  },
  {
    step: '02',
    title: 'Matching Engine',
    desc: 'Haversine distance & demand scoring',
    icon: Sparkles,
    color: 'from-[#D4A94A] to-[#B38728]'
  },
  {
    step: '03',
    title: 'Top 3 Ranked',
    desc: 'Human-readable reasoning string',
    icon: Award,
    color: 'from-[#C1502E] to-[#8C2C12]'
  },
  {
    step: '04',
    title: 'NGO Accepts',
    desc: 'Auto-decrements needed quantity',
    icon: CheckCircle2,
    color: 'from-[#7A9471] to-[#516C49]'
  },
  {
    step: '05',
    title: 'Impact Tracked',
    desc: 'Zero waste & community stats',
    icon: HeartHandshake,
    color: 'from-[#D4A94A] to-[#C1502E]'
  }
];

export default function SystemFlowDiagram() {
  return (
    <div className="card-dark p-8 sm:p-12 relative overflow-hidden bg-[#242424] border border-[#333333] space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="editorial-label">SYSTEM ARCHITECTURE</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#F5F1E8]">
          How ReThread Intelligently Routes Clothing
        </h2>
        <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed">
          From donor upload to real-time NGO acceptance — automated multi-factor scoring ensures zero garment waste.
        </p>
      </div>

      {/* Horizontal Connected Node Flow Diagram */}
      <div className="relative">
        
        {/* Animated Connecting Flow Path Line (SVG) */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 z-0 pointer-events-none">
          <svg className="w-full h-12 overflow-visible">
            <defs>
              <linearGradient id="flowGradientTerracotta" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C1502E" />
                <stop offset="50%" stopColor="#D4A94A" />
                <stop offset="100%" stopColor="#C1502E" />
              </linearGradient>
            </defs>

            {/* Base line */}
            <line 
              x1="5%" 
              y1="24" 
              x2="95%" 
              y2="24" 
              stroke="#333333" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
            />

            {/* Animated Flowing Line */}
            <motion.line 
              x1="5%" 
              y1="24" 
              x2="95%" 
              y2="24" 
              stroke="url(#flowGradientTerracotta)" 
              strokeWidth="3" 
              strokeDasharray="12 12"
              animate={{ strokeDashoffset: [-40, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            />
          </svg>
        </div>

        {/* 5 Step Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#1A1A1A] rounded-sm p-6 border border-[#333333] hover:border-[#C1502E] transition-all duration-300 relative group flex flex-col justify-between space-y-4"
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between">
                  <span className="editorial-label text-[9px] text-[#D4A94A]">
                    STEP {step.step}
                  </span>
                  <div className={`w-10 h-10 rounded-sm bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Node Content */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-black text-[#F5F1E8] group-hover:text-[#C1502E] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connector Arrow for mobile/sm */}
                {idx < STEPS.length - 1 && (
                  <div className="block lg:hidden text-center pt-2 text-[#D4A94A]">
                    <ArrowRight className="w-4 h-4 mx-auto rotate-90 sm:rotate-0" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
