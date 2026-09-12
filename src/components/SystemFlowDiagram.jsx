import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Award, CheckCircle2, HeartHandshake, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Donor Uploads',
    desc: 'Garment specs, photo & pickup location',
    icon: Upload,
    color: 'from-[#4A7C59] to-[#2F533A]'
  },
  {
    step: '02',
    title: 'Matching Engine',
    desc: 'Haversine distance & demand scoring',
    icon: Sparkles,
    color: 'from-[#2F533A] to-[#1D2921]'
  },
  {
    step: '03',
    title: 'Top 3 Ranked',
    desc: 'Human-readable reasoning string',
    icon: Award,
    color: 'from-[#4A7C59] to-[#2F533A]'
  },
  {
    step: '04',
    title: 'NGO Accepts',
    desc: 'Auto-decrements needed quantity',
    icon: CheckCircle2,
    color: 'from-emerald-700 to-teal-900'
  },
  {
    step: '05',
    title: 'Impact Tracked',
    desc: 'Zero waste & community stats',
    icon: HeartHandshake,
    color: 'from-rose-600 to-amber-700'
  }
];

export default function SystemFlowDiagram() {
  return (
    <div className="card-static p-8 sm:p-12 relative overflow-hidden bg-gradient-to-b from-white via-[#FAF8F5] to-white border border-[#E2DCD2] space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full badge-gradient-sage text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#4A7C59]" strokeWidth={1.75} />
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1D2921]">
          How ReThread Intelligently Routes Clothing
        </h2>
        <p className="text-xs sm:text-sm text-[#637367] leading-relaxed">
          From donor upload to real-time NGO acceptance — automated multi-factor scoring ensures zero garment waste.
        </p>
      </div>

      {/* Horizontal Connected Node Flow Diagram */}
      <div className="relative">
        
        {/* Animated Connecting Flow Path Line (SVG) */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 z-0 pointer-events-none">
          <svg className="w-full h-12 overflow-visible">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A7C59" />
                <stop offset="50%" stopColor="#2F533A" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Base line */}
            <line 
              x1="5%" 
              y1="24" 
              x2="95%" 
              y2="24" 
              stroke="#E2DCD2" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
            />

            {/* Animated Flowing Line */}
            <motion.line 
              x1="5%" 
              y1="24" 
              x2="95%" 
              y2="24" 
              stroke="url(#flowGradient)" 
              strokeWidth="3" 
              strokeDasharray="12 12"
              animate={{ strokeDashoffset: [-40, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
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
                whileHover={{ y: -6, transition: { duration: 0.15 } }}
                className="bg-white rounded-2xl p-6 border border-[#E2DCD2] shadow-md hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between space-y-4"
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#87968B]">
                    STEP {step.step}
                  </span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Node Content */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-[#1D2921] group-hover:text-[#4A7C59] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#637367] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connector Arrow for mobile/sm */}
                {idx < STEPS.length - 1 && (
                  <div className="block lg:hidden text-center pt-2 text-[#87968B]">
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
