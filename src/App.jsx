import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import DonorPortal from './components/DonorPortal';
import NgoDashboard from './components/NgoDashboard';
import ImpactDashboard from './components/ImpactDashboard';
import RecyclingHub from './components/RecyclingHub';
import { API_BASE_URL } from './config/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('donor');
  const [stats, setStats] = useState(null);

  const fetchGlobalStats = () => {
    fetch(`${API_BASE_URL}/api/impact`)
      .then(res => res.json())
      .then(data => {
        if (data && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col font-sans text-[#1D2921] antialiased selection:bg-[#4A7C59] selection:text-white">
      
      {/* Top Sticky Navigation Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats} 
      />

      {/* Main Content Area with Animated Page Transitions */}
      <main className="flex-1 pb-16 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'donor' && (
              <DonorPortal 
                onNavigateRecycling={() => setActiveTab('recycling')} 
                onItemDonated={fetchGlobalStats}
              />
            )}

            {activeTab === 'ngo' && (
              <NgoDashboard 
                onDataUpdated={fetchGlobalStats}
              />
            )}

            {activeTab === 'recycling' && (
              <RecyclingHub />
            )}

            {activeTab === 'impact' && (
              <ImpactDashboard />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Sustainable Footer */}
      <footer className="border-t border-[#EAE5DC] bg-[#FAF8F5] py-8 text-center text-xs text-[#637367]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A7C59]" />
            <span className="font-bold text-[#1D2921]">ReThread</span>
            <span>— Smart Clothing Redistribution Platform</span>
          </div>
          <p>© 2026 ReThread. Intelligent zero-waste apparel matching.</p>
        </div>
      </footer>

    </div>
  );
}
