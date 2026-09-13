import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, MapPin, Building, Home, Users, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AuthScreen({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountType, setAccountType] = useState('donor'); // 'donor' | 'receiver'
  
  // Basic Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Additional Fields
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');

  // Receiver Additional Fields
  const [finderType, setFinderType] = useState('ngo'); // 'individual' | 'ngo' | 'community'
  const [organizationName, setOrganizationName] = useState('');
  const [storageCapacity, setStorageCapacity] = useState('100');
  const [householdSize, setHouseholdSize] = useState('3');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickDemoLogin = async (demoEmail, demoPassword = 'demo123') => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.token && data.user) {
        localStorage.setItem('rethread_token', data.token);
        localStorage.setItem('rethread_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? `${API_BASE_URL}/api/auth/signup` : `${API_BASE_URL}/api/auth/login`;

    const payload = isSignUp ? {
      email,
      password,
      accountType,
      fullName: accountType === 'donor' || finderType === 'individual' ? fullName : organizationName,
      location,
      finderType,
      organizationName,
      storageCapacity: Number(storageCapacity),
      householdSize: Number(householdSize)
    } : {
      email,
      password
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.token && data.user) {
        localStorage.setItem('rethread_token', data.token);
        localStorage.setItem('rethread_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1512] text-[#F9F6F0] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1E3A2B]/40 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#C1502E]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center mb-6 text-center"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A2B] to-[#2D5A43] flex items-center justify-center border border-[#3E6B52]/40 shadow-lg shadow-[#1E3A2B]/50">
            <Sparkles className="w-5 h-5 text-[#E6C687]" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">RE<span className="text-[#E6C687]">THREAD</span></span>
        </div>
        <p className="text-xs font-semibold text-[#8DA697] uppercase tracking-widest">Autonomous Clothing Redistribution Platform</p>
      </motion.div>

      {/* Auth Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md bg-[#16221D]/90 backdrop-blur-xl border border-[#2D4539] rounded-3xl p-8 shadow-2xl shadow-black/80"
      >
        {/* ONE-CLICK DEMO ACCOUNTS BAR */}
        <div className="mb-6 bg-[#0E1512]/80 p-3.5 rounded-2xl border border-[#23382E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E6C687]">
              ⚡ ONE-CLICK DEMO ACCOUNTS
            </span>
            <span className="text-[9px] font-semibold text-[#8DA697]">Auto-Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('donor@rethread.org')}
              className="px-2.5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#284C3A] border border-[#3E6B52] text-left transition-all group"
            >
              <div className="text-[10px] font-bold text-white flex items-center space-x-1">
                <span>🎁</span>
                <span className="truncate">Donor Portal</span>
              </div>
              <div className="text-[9px] text-[#8DA697] truncate">1 Donor Account</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('hopehaven@rethread.org')}
              className="px-2.5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#284C3A] border border-[#3E6B52] text-left transition-all group"
            >
              <div className="text-[10px] font-bold text-white flex items-center space-x-1">
                <span>🏢</span>
                <span className="truncate">Receiver #1 (NGO)</span>
              </div>
              <div className="text-[9px] text-[#8DA697] truncate">Emergency Shelter</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('missioncommunity@rethread.org')}
              className="px-2.5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#284C3A] border border-[#3E6B52] text-left transition-all group"
            >
              <div className="text-[10px] font-bold text-white flex items-center space-x-1">
                <span>🏬</span>
                <span className="truncate">Receiver #2 (Community)</span>
              </div>
              <div className="text-[9px] text-[#8DA697] truncate">Clothes Closet</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sarah.family@rethread.org')}
              className="px-2.5 py-2 rounded-xl bg-[#1E3A2B] hover:bg-[#284C3A] border border-[#3E6B52] text-left transition-all group"
            >
              <div className="text-[10px] font-bold text-white flex items-center space-x-1">
                <span>🏠</span>
                <span className="truncate">Receiver #3 (Individual)</span>
              </div>
              <div className="text-[9px] text-[#8DA697] truncate">Family Household</div>
            </button>
          </div>
        </div>

        {/* Sign In vs Sign Up Toggle Header */}
        <div className="flex bg-[#0E1512] p-1.5 rounded-2xl mb-6 border border-[#23382E]">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              !isSignUp 
                ? 'bg-[#1E3A2B] text-white shadow-md border border-[#3E6B52]' 
                : 'text-[#8DA697] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              isSignUp 
                ? 'bg-[#1E3A2B] text-white shadow-md border border-[#3E6B52]' 
                : 'text-[#8DA697] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8DA697] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7D6D]" />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0E1512] border border-[#2B4236] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#456152] focus:outline-none focus:border-[#4E8568] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8DA697] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7D6D]" />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0E1512] border border-[#2B4236] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#456152] focus:outline-none focus:border-[#4E8568] transition-colors"
              />
            </div>
          </div>

          {/* SIGN UP ADDITIONAL FIELDS */}
          {isSignUp && (
            <>
              {/* Account Type Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8DA697] mb-1.5">I am signing up as a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('donor')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      accountType === 'donor'
                        ? 'bg-[#1E3A2B] border-[#E6C687] text-white shadow-lg'
                        : 'bg-[#0E1512] border-[#2B4236] text-[#8DA697] hover:border-[#456152]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 mb-1 ${accountType === 'donor' ? 'text-[#E6C687]' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">Donor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('receiver')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      accountType === 'receiver'
                        ? 'bg-[#1E3A2B] border-[#E6C687] text-white shadow-lg'
                        : 'bg-[#0E1512] border-[#2B4236] text-[#8DA697] hover:border-[#456152]'
                    }`}
                  >
                    <Building className={`w-5 h-5 mb-1 ${accountType === 'receiver' ? 'text-[#E6C687]' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">Receiver</span>
                  </button>
                </div>
              </div>

              {/* DONOR SPECIFIC FIELDS */}
              {accountType === 'donor' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8DA697] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7D6D]" />
                      <input 
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#0E1512] border border-[#2B4236] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#456152] focus:outline-none focus:border-[#4E8568]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8DA697] mb-1.5">Location / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7D6D]" />
                      <input 
                        type="text"
                        required
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="San Francisco, CA"
                        className="w-full bg-[#0E1512] border border-[#2B4236] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#456152] focus:outline-none focus:border-[#4E8568]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* RECEIVER SPECIFIC FIELDS */}
              {accountType === 'receiver' && (
                <div className="space-y-3 p-3 bg-[#0E1512]/60 rounded-2xl border border-[#23382E]">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Receiver Profile Type</label>
                    <select
                      value={finderType}
                      onChange={e => setFinderType(e.target.value)}
                      className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="ngo">NGO / Non-Profit Shelter</option>
                      <option value="individual">Individual / Household Need</option>
                      <option value="community">Community Clothes Closet</option>
                    </select>
                  </div>

                  {finderType === 'individual' ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Maria Santos"
                          className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Location</label>
                          <input 
                            type="text"
                            required
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Household Size</label>
                          <input 
                            type="number"
                            min="1"
                            value={householdSize}
                            onChange={e => setHouseholdSize(e.target.value)}
                            className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Organization Name</label>
                        <input 
                          type="text"
                          required
                          value={organizationName}
                          onChange={e => setOrganizationName(e.target.value)}
                          placeholder="e.g. Bay Area Outreach Shelter"
                          className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Location</label>
                          <input 
                            type="text"
                            required
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8DA697] mb-1">Storage Capacity</label>
                          <input 
                            type="number"
                            min="10"
                            value={storageCapacity}
                            onChange={e => setStorageCapacity(e.target.value)}
                            placeholder="300"
                            className="w-full bg-[#16221D] border border-[#2B4236] rounded-xl py-2 px-3 text-xs text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1E3A2B] to-[#2B543F] hover:from-[#254836] hover:to-[#33634B] text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-[#1E3A2B]/40 border border-[#43755C] flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 text-[#E6C687]" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#23382E] text-center text-xs text-[#6F8C7C]">
          <span>Protected with secure 256-bit hash encryption.</span>
        </div>
      </motion.div>
    </div>
  );
}
