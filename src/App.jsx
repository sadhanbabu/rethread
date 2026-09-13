import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthScreen from './components/AuthScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import Navbar from './components/Navbar';
import DonorPortal from './components/DonorPortal';
import MyDonations from './components/MyDonations';
import NgoDashboard from './components/NgoDashboard';
import ImpactDashboard from './components/ImpactDashboard';
import RecyclingHub from './components/RecyclingHub';
import { API_BASE_URL } from './config/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'donor' | 'finder'
  const [finderType, setFinderType] = useState('ngo'); // 'individual' | 'ngo' | 'community'
  const [selectedFinderId, setSelectedFinderId] = useState(null);
  const [activeTab, setActiveTab] = useState('donor');
  const [activeSelectItem, setActiveSelectItem] = useState(null);
  const [stats, setStats] = useState(null);

  // 1. Session check on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rethread_user');
    const savedToken = localStorage.getItem('rethread_token');

    if (savedUser && savedToken) {
      try {
        const userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);
        if (userObj.accountType === 'receiver') {
          setRole('finder');
          setActiveTab('post-need');
          if (userObj.profile && userObj.profile.type) {
            setFinderType(userObj.profile.type);
          }
          if (userObj.profile && userObj.profile.id) {
            setSelectedFinderId(userObj.profile.id);
          }
        } else {
          setRole('donor');
          setActiveTab('donor');
        }
      } catch (e) {
        localStorage.removeItem('rethread_user');
        localStorage.removeItem('rethread_token');
      }
    }
  }, []);

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

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    if (user.accountType === 'receiver') {
      setRole('finder');
      setActiveTab('post-need');
      if (user.profile && user.profile.type) {
        setFinderType(user.profile.type);
      }
      if (user.profile && user.profile.id) {
        setSelectedFinderId(user.profile.id);
      }
    } else {
      setRole('donor');
      setActiveTab('donor');
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('rethread_token');
    localStorage.removeItem('rethread_user');
    setCurrentUser(null);
    setRole(null);
    setSelectedFinderId(null);
  };

  const handleSelectRole = (chosenRole, newFinderId = null) => {
    setRole(chosenRole);
    if (newFinderId) {
      setSelectedFinderId(newFinderId);
    }
    if (chosenRole === 'donor') {
      setActiveTab('donor');
    } else if (chosenRole === 'finder') {
      setActiveTab('post-need');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col font-sans text-[#1D2921] antialiased selection:bg-[#1E3A2B] selection:text-white">
      
      {/* 1. AUTH SCREEN ON FIRST VISIT / NO ACTIVE SESSION */}
      {!currentUser ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          {/* Top Sticky Role-Specific Navigation Navbar */}
          <Navbar 
            role={role}
            finderType={finderType}
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            stats={stats} 
            onSwitchRole={handleLogOut}
            currentUser={currentUser}
            onLogOut={handleLogOut}
          />

          {/* Main Content Area */}
          <main className="flex-1 pb-16 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${role}-${activeTab}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* DONOR FLOW VIEWS */}
                {role === 'donor' && activeTab === 'donor' && (
                  <DonorPortal 
                    initialItem={activeSelectItem}
                    onNavigateRecycling={() => setActiveTab('recycling')} 
                    onNavigateMyDonations={() => setActiveTab('my-donations')}
                    onItemDonated={fetchGlobalStats}
                  />
                )}

                {role === 'donor' && activeTab === 'my-donations' && (
                  <MyDonations 
                    onNavigateDonate={(itemToMatch) => {
                      if (itemToMatch) {
                        setActiveSelectItem(itemToMatch);
                      } else {
                        setActiveSelectItem(null);
                      }
                      setActiveTab('donor');
                    }} 
                  />
                )}

                {role === 'donor' && activeTab === 'impact' && (
                  <ImpactDashboard />
                )}

                {/* FINDER FLOW VIEWS */}
                {role === 'finder' && (
                  <NgoDashboard 
                    finderType={finderType}
                    activeSubTab={activeTab}
                    initialSelectedNgoId={selectedFinderId}
                    currentUser={currentUser}
                    onDataUpdated={fetchGlobalStats}
                  />
                )}

                {/* BACKEND-ONLY ROUTE RECYCLING FALLBACK VIEW */}
                {activeTab === 'recycling' && (
                  <RecyclingHub />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Editorial Dark Footer */}
          <footer className="border-t border-[#333333] bg-[#141414] py-8 text-center text-xs text-[#888888]">
            <div className="max-w-[1300px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C1502E]" />
                <span className="font-bold text-[#F5F1E8]">RETHREAD</span>
                <span>— Smart Clothing Redistribution Platform</span>
              </div>
              
              <button 
                onClick={handleLogOut} 
                className="text-[#D4A94A] hover:underline font-bold uppercase tracking-wider text-[11px]"
              >
                Logged in as {currentUser.email} ({currentUser.accountType.toUpperCase()}) — Log Out
              </button>

              <p>© 2026 ReThread. Intelligent zero-waste apparel matching.</p>
            </div>
          </footer>
        </>
      )}

    </div>
  );
}
