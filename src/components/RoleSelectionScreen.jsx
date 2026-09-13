import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, HeartHandshake, Building2, User, Users, Sparkles, Leaf, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import FinderRegistrationModal from './FinderRegistrationModal';

export default function RoleSelectionScreen({ onSelectRole, onSelectFinderType, onSetSelectedFinderId }) {
  const [selectedRole, setSelectedRole] = useState(null); // 'donor' | 'finder'
  const [chosenFinderType, setChosenFinderType] = useState(null); // 'individual' | 'ngo' | 'community'
  const [finderMode, setFinderMode] = useState(null); // 'existing' | 'create'
  
  // Existing finders fetched for dropdown
  const [existingFinders, setExistingFinders] = useState([]);
  const [selectedFinderId, setSelectedFinderId] = useState('');
  const [loadingFinders, setLoadingFinders] = useState(false);

  // Show registration modal flag
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleChooseDonor = () => {
    onSelectRole('donor');
  };

  const handleSelectType = (type) => {
    setChosenFinderType(type);
    onSelectFinderType(type);
    setFinderMode(null);
  };

  // Fetch seeded/registered finders when type is chosen
  useEffect(() => {
    if (chosenFinderType) {
      setLoadingFinders(true);
      fetch(`${API_BASE_URL}/api/ngos?type=${chosenFinderType}`)
        .then(res => res.json())
        .then(data => {
          setExistingFinders(data);
          if (data && data.length > 0) {
            setSelectedFinderId(data[0].id);
          }
          setLoadingFinders(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingFinders(false);
        });
    }
  }, [chosenFinderType]);

  const handleConfirmExistingLogin = () => {
    if (selectedFinderId) {
      onSetSelectedFinderId(Number(selectedFinderId));
      onSelectRole('finder');
    }
  };

  const handleRegisterSuccess = (newRecord) => {
    setShowRegisterModal(false);
    onSetSelectedFinderId(newRecord.id);
    onSelectRole('finder');
  };

  const nameLabel = chosenFinderType === 'individual' ? 'Full Name' : 'Organization Name';

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden font-sans text-[#F5F1E8]">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-[600px] h-[600px] rounded-full bg-[#C1502E]/10 blur-[130px] absolute -top-40 -left-20 animate-pulse" />
        <div className="w-[500px] h-[500px] rounded-full bg-[#D4A94A]/10 blur-[120px] absolute -bottom-30 -right-20 animate-pulse" />
      </div>

      {/* Editorial Micro-Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#D4A94A 1.2px, transparent 1.2px)`,
          backgroundSize: `28px 28px`
        }}
      />

      <div className="max-w-4xl w-full space-y-14 relative z-10 text-center">
        
        {/* Editorial Brand Header */}
        <div className="space-y-4">
          <p className="editorial-label">00 — CIRCULARITY PLATFORM</p>

          <h1 className="font-serif text-5xl sm:text-7xl font-black tracking-tight text-[#F5F1E8] max-w-3xl mx-auto leading-none">
            What brings you here <span className="italic text-[#C1502E]">today?</span>
          </h1>

          <p className="text-sm sm:text-base text-[#AAAAAA] max-w-lg mx-auto font-normal leading-relaxed">
            Select your perspective to enter the tailored redistribution workspace.
          </p>
        </div>

        {/* STEP 1: Donor vs Finder Primary Cards */}
        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Donor Choice Card */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={handleChooseDonor}
              className="card-dark p-10 cursor-pointer space-y-6 border border-[#333333] hover:border-[#C1502E] transition-all group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-sm bg-[#C1502E]/20 text-[#C1502E] border border-[#C1502E]/40 flex items-center justify-center group-hover:bg-[#C1502E] group-hover:text-white transition-colors">
                <Gift className="w-7 h-7" strokeWidth={1.75} />
              </div>

              <div className="space-y-3">
                <p className="editorial-label text-[#D4A94A]">OPTION 01 — DONOR</p>
                <h2 className="font-serif text-3xl font-black text-[#F5F1E8] group-hover:text-[#C1502E] transition-colors">
                  I want to donate clothes
                </h2>
                <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed">
                  Upload unused garments, view top AI-ranked shelter matches by distance and urgency, and track item delivery.
                </p>
              </div>

              <div className="pt-4 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#C1502E]">
                <span>ENTER DONOR WORKSPACE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

            {/* Finder Choice Card */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={() => setSelectedRole('finder')}
              className="card-dark p-10 cursor-pointer space-y-6 border border-[#333333] hover:border-[#D4A94A] transition-all group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-sm bg-[#D4A94A]/20 text-[#D4A94A] border border-[#D4A94A]/40 flex items-center justify-center group-hover:bg-[#D4A94A] group-hover:text-[#1A1A1A] transition-colors">
                <HeartHandshake className="w-7 h-7" strokeWidth={1.75} />
              </div>

              <div className="space-y-3">
                <p className="editorial-label text-[#D4A94A]">OPTION 02 — RECIPIENT</p>
                <h2 className="font-serif text-3xl font-black text-[#F5F1E8] group-hover:text-[#D4A94A] transition-colors">
                  I'm looking for clothes
                </h2>
                <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed">
                  Post garment needs, manage household or shelter storage, and confirm incoming matched apparel.
                </p>
              </div>

              <div className="pt-4 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#D4A94A]">
                <span>ENTER RECIPIENT WORKSPACE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

          </div>
        ) : !chosenFinderType ? (
          /* STEP 2: Finder Type Selection (Individual vs NGO / Shelter vs Community Org) */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-dark p-10 max-w-2xl mx-auto space-y-8 text-left border border-[#333333]"
          >
            <div className="flex items-center justify-between border-b border-[#333333] pb-4">
              <div>
                <p className="editorial-label">STEP 01 — SPECIFY RECIPIENT TYPE</p>
                <h2 className="font-serif text-2xl font-black text-[#F5F1E8]">I am a...</h2>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs font-bold uppercase tracking-widest text-[#D4A94A] hover:underline"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              
              {/* Individual Option */}
              <button
                onClick={() => handleSelectType('individual')}
                className="p-5 rounded-sm border border-[#333333] bg-[#242424] hover:bg-[#2C2C2C] hover:border-[#C1502E] text-left transition-all flex items-center space-x-4 group"
              >
                <div className="w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#C1502E] border border-[#333333] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#F5F1E8]">Individual / Household</h3>
                  <p className="text-xs text-[#888888]">Request apparel for yourself or family members (Label: Full Name)</p>
                </div>
              </button>

              {/* NGO / Shelter Option */}
              <button
                onClick={() => handleSelectType('ngo')}
                className="p-5 rounded-sm border border-[#333333] bg-[#242424] hover:bg-[#2C2C2C] hover:border-[#D4A94A] text-left transition-all flex items-center space-x-4 group"
              >
                <div className="w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#D4A94A] border border-[#333333] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#F5F1E8]">NGO / Emergency Shelter</h3>
                  <p className="text-xs text-[#888888]">Manage shelter inventory capacity & bulk needs (Label: Organization Name)</p>
                </div>
              </button>

              {/* Community Org Option */}
              <button
                onClick={() => handleSelectType('community')}
                className="p-5 rounded-sm border border-[#333333] bg-[#242424] hover:bg-[#2C2C2C] hover:border-[#C1502E] text-left transition-all flex items-center space-x-4 group"
              >
                <div className="w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#C1502E] border border-[#333333] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#F5F1E8]">Community Organization</h3>
                  <p className="text-xs text-[#888888]">Wardrobe closets and mutual aid groups (Label: Organization Name)</p>
                </div>
              </button>

            </div>
          </motion.div>
        ) : (
          /* STEP 3: Choice between "Select Existing Profile" or "Create New Profile" */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-dark p-10 max-w-2xl mx-auto space-y-8 text-left border border-[#333333]"
          >
            <div className="flex items-center justify-between border-b border-[#333333] pb-4">
              <div>
                <p className="editorial-label">STEP 02 — ACCOUNT FLOW ({chosenFinderType.toUpperCase()})</p>
                <h2 className="font-serif text-2xl font-black text-[#F5F1E8]">Choose Profile Access</h2>
              </div>
              <button
                onClick={() => setChosenFinderType(null)}
                className="text-xs font-bold uppercase tracking-widest text-[#D4A94A] hover:underline"
              >
                ← Back to Types
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Select Existing Profile */}
              <div className="bg-[#1A1A1A] p-6 rounded-sm border border-[#333333] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm bg-[#D4A94A]/20 text-[#D4A94A] flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#F5F1E8]">Select Existing Profile</h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Pick from pre-seeded {chosenFinderType} accounts for rapid demo exploration.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {loadingFinders ? (
                    <p className="text-xs text-[#D4A94A]">Loading profiles...</p>
                  ) : (
                    <select
                      value={selectedFinderId}
                      onChange={(e) => setSelectedFinderId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-sm border border-[#333333] bg-[#242424] text-xs font-bold text-[#F5F1E8] focus:outline-none"
                    >
                      {existingFinders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={handleConfirmExistingLogin}
                    disabled={!selectedFinderId}
                    className="btn-primary w-full py-3 text-xs tracking-wider"
                  >
                    CONTINUE WITH SELECTED
                  </button>
                </div>
              </div>

              {/* Option B: Create New Profile */}
              <div className="bg-[#1A1A1A] p-6 rounded-sm border border-[#333333] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm bg-[#C1502E]/20 text-[#C1502E] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#C1502E]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#F5F1E8]">Create New Profile</h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Register a brand new {chosenFinderType} profile with custom {nameLabel}.
                  </p>
                </div>

                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="btn-secondary w-full py-3 text-xs tracking-wider border-[#C1502E] text-[#C1502E] hover:bg-[#C1502E] hover:text-white"
                >
                  + REGISTER NEW PROFILE
                </button>
              </div>

            </div>
          </motion.div>
        )}

      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <FinderRegistrationModal
          finderType={chosenFinderType}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

    </div>
  );
}
