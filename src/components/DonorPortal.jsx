import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, MapPin, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Heart, Recycle, ArrowDown, Image as ImageIcon, X } from 'lucide-react';
import { ITEM_CATEGORIES } from '../constants/itemTypes';
import { API_BASE_URL } from '../config/api';
import Hero3DElement from './Hero3DElement';
import SystemFlowDiagram from './SystemFlowDiagram';
import TiltCard from './TiltCard';
import AnimatedScoreRing from './AnimatedScoreRing';

const PRESET_IMAGES = [
  { label: 'Winter Puffer Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80', type: 'Jacket', size: 'L', gender: 'Men', condition: 'Gently Used' },
  { label: "Kids Fleece Parka", url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80', type: 'Kids Coat', size: 'S', gender: 'Kids', condition: 'New' },
  { label: 'Warm Knit Sweater', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80', type: 'Sweater', size: 'M', gender: 'Women', condition: 'Gently Used' },
  { label: 'Damaged Denim Jeans', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', type: 'Jeans', size: 'M', gender: 'Men', condition: 'Needs Repair' },
];

const LOCATION_PRESETS = [
  { name: 'SoMa, San Francisco', lat: 37.7812, lng: -122.3989 },
  { name: 'Mission District, SF', lat: 37.7599, lng: -122.4148 },
  { name: 'Hayes Valley, SF', lat: 37.7765, lng: -122.4242 },
  { name: 'Financial District, SF', lat: 37.7946, lng: -122.4001 },
  { name: 'Castro, SF', lat: 37.7609, lng: -122.4350 },
];

export default function DonorPortal({ onNavigateRecycling, onItemDonated }) {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: 'Warm North Face Puffer Jacket',
    description: 'Navy blue insulated winter coat in pristine condition.',
    item_type: 'Jacket',
    size: 'L',
    gender: 'Men',
    season: 'Winter',
    condition: 'Gently Used',
    photo_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    donor_name: 'Alex Rivera',
    donor_location_name: 'SoMa, San Francisco',
    latitude: 37.7812,
    longitude: -122.3989,
  });

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [acceptedNgoId, setAcceptedNgoId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePresetSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      title: preset.label,
      item_type: preset.type,
      size: preset.size,
      gender: preset.gender,
      condition: preset.condition,
      photo_url: preset.url
    }));
  };

  const handleLocationSelect = (locName) => {
    const loc = LOCATION_PRESETS.find(l => l.name === locName);
    if (loc) {
      setFormData(prev => ({
        ...prev,
        donor_location_name: loc.name,
        latitude: loc.lat,
        longitude: loc.lng
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMatchResult(null);
    setAcceptedNgoId(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      setSubmittedItem(data.item);
      setMatchResult(data.matchResult);
      if (onItemDonated) onItemDonated();
    } catch (err) {
      console.error('Error submitting donation item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDonation = async (match) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ngo-matches/${match.ngo.id}`);
      const matches = await res.json();
      const itemMatch = matches.find(m => m.item_id === submittedItem.id);

      if (itemMatch) {
        await fetch(`${API_BASE_URL}/api/matches/${itemMatch.id}/accept`, { method: 'POST' });
      }

      setAcceptedNgoId(match.ngo.id);
      if (onItemDonated) onItemDonated();
    } catch (err) {
      console.error(err);
      setAcceptedNgoId(match.ngo.id);
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-16 animate-fade-in">
      
      {/* 1. HERO SECTION WITH ANIMATED GRADIENT MESH, DOT GRID & GLASSMORPHISM */}
      <section className="bg-[#FAF8F5] rounded-[24px] p-8 sm:p-14 border border-[#E2DCD2] relative overflow-hidden shadow-sm">
        
        {/* Layer 1: Animated Gradient Mesh Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            animate={{ 
              x: [0, 20, -15, 0],
              y: [0, -25, 15, 0],
            }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            className="w-[420px] h-[420px] rounded-full bg-[#4A7C59]/18 blur-[90px] absolute -top-24 -left-20"
          />
          <motion.div 
            animate={{ 
              x: [0, -25, 20, 0],
              y: [0, 20, -20, 0],
            }}
            transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
            className="w-[380px] h-[380px] rounded-full bg-[#A8C4A2]/25 blur-[80px] absolute -bottom-20 -right-10"
          />
          <motion.div 
            animate={{ 
              x: [0, 15, -10, 0],
              y: [0, 15, -15, 0],
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            className="w-[300px] h-[300px] rounded-full bg-[#E5DFC5]/35 blur-[70px] absolute top-1/3 left-1/2 -translate-x-1/2"
          />
        </div>

        {/* Layer 2: Subtle Engineered Dot Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#2F533A 1.2px, transparent 1.2px)`,
            backgroundSize: `20px 20px`
          }}
        />

        {/* Layer 3: Edge Vignette */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(47,83,58,0.06)_100%)]" />

        {/* Layer 4: Floating Particle Accents */}
        <motion.div
          animate={{ y: [-6, 8, -6] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="w-2.5 h-2.5 rounded-full bg-[#4A7C59]/60 shadow-sm absolute top-12 left-1/4 pointer-events-none z-10"
        />
        <motion.div
          animate={{ y: [8, -8, 8] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-[#2F533A]/50 shadow-sm absolute bottom-16 left-1/3 pointer-events-none z-10"
        />
        <motion.div
          animate={{ y: [-10, 6, -10] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="w-3 h-3 rounded-full bg-[#A8C4A2]/80 shadow-sm absolute top-20 right-1/3 pointer-events-none z-10"
        />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            
            {/* GLASSMORPHIC BADGE (REQUIREMENT 5) */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#4A7C59]/30 text-xs font-semibold text-[#2F533A] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#4A7C59]" strokeWidth={2} />
              <span>AI MATCHING ENGINE & ZERO-WASTE ROUTING</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#1D2921] leading-[1.15]">
              Give clothing a second life where it matters most.
            </h1>

            <p className="text-base sm:text-lg text-[#637367] font-normal leading-[1.6]">
              ReThread pairs your extra wardrobe directly with local emergency shelters based on real-time urgency, proximity, and storage availability. Damaged items automatically route to certified textile recyclers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={scrollToForm}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base"
              >
                <span>Start Donation Form</span>
                <ArrowDown className="w-4 h-4" strokeWidth={2} />
              </button>

              <span className="text-xs text-[#87968B] font-medium">
                Over <strong>31 items</strong> matched in the Bay Area this week
              </span>
            </div>
          </div>

          {/* Right 3D Sphere Element with Glow Backlight (REQUIREMENT 6) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="w-72 h-72 rounded-full bg-[#4A7C59]/25 blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <Hero3DElement />
          </div>

        </div>
      </section>

      {/* 2. SYSTEM FLOW DIAGRAM */}
      <SystemFlowDiagram />

      {/* 3. MAIN TWO-COLUMN GRID: FORM + MATCH RESULTS */}
      <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Card */}
        <div className="lg:col-span-6 card-static p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Donate a Garment</h2>
              <p className="text-xs text-[#637367] mt-0.5">Select garment details and location for instant match ranking</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A7C59] animate-pulse" />
          </div>

          {/* Demo Presets */}
          <div>
            <label className="text-xs font-semibold text-[#637367] uppercase tracking-wider block mb-2">
              Quick Demo Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                    formData.photo_url === preset.url
                      ? 'bg-[#4A7C59] text-white border-[#4A7C59] font-semibold shadow-sm'
                      : 'bg-[#F9F6F0] text-[#1D2921] border-[#E2DCD2] hover:bg-[#EAE5DC]'
                  }`}
                >
                  {preset.label} {preset.condition === 'Needs Repair' ? '🔧' : ''}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Garment Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-sm text-[#1D2921] focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all"
                placeholder="e.g. Warm North Face Winter Jacket"
              />
            </div>

            {/* Photo Upload (Optional) + URL Fallback */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider">
                  Photo <span className="text-[#637367] font-normal lowercase">(optional)</span>
                </label>
                {formData.photo_url && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-2xl border border-[#E2DCD2] bg-[#FAF8F5] flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                  {formData.photo_url ? (
                    <img 
                      src={formData.photo_url} 
                      alt="Item Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"; }}
                    />
                  ) : (
                    <div className="text-center p-2 text-[#87968B]">
                      <ImageIcon className="w-6 h-6 mx-auto mb-0.5" strokeWidth={1.5} />
                      <span className="text-[9px] font-medium block">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-file-input"
                    />
                    <label
                      htmlFor="photo-file-input"
                      className="btn-secondary py-2 px-3.5 text-xs inline-flex items-center space-x-2 cursor-pointer w-full justify-center"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#4A7C59]" strokeWidth={2} />
                      <span>Upload from Device</span>
                    </label>
                  </div>

                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all"
                    placeholder="Or paste image URL fallback"
                  />
                </div>
              </div>
            </div>

            {/* Categorized Garment Type & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Garment Type</label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                >
                  {ITEM_CATEGORIES.map((catGroup) => (
                    <optgroup key={catGroup.category} label={`-- ${catGroup.category} --`}>
                      {catGroup.items.map((itemType) => (
                        <option key={itemType} value={itemType}>
                          {itemType}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                >
                  {['S', 'M', 'L', 'XL', 'Kids', 'Any'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender & Season */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Gender / Category</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                >
                  {['Men', 'Women', 'Kids', 'Unisex'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                >
                  {['Winter', 'Summer', 'All-Season'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition Select */}
            <div>
              <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Condition</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'New', desc: 'Brand new / tags on' },
                  { id: 'Gently Used', desc: 'Clean, intact quality' },
                  { id: 'Worn', desc: 'Faded but functional' },
                  { id: 'Needs Repair', desc: 'Torn/stained -> Recycling' }
                ].map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: cond.id })}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      formData.condition === cond.id
                        ? cond.id === 'Needs Repair'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                          : 'bg-[#EBF2ED] border-[#4A7C59] text-[#1D2921] ring-2 ring-[#4A7C59]'
                        : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#637367] hover:bg-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{cond.id}</span>
                      {cond.id === 'Needs Repair' && <Recycle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-[#637367] mt-0.5">{cond.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-xs font-bold text-[#1D2921] uppercase tracking-wider mb-1.5">Pickup Location</label>
              <select
                value={formData.donor_location_name}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
              >
                {LOCATION_PRESETS.map(loc => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#EBF2ED]" strokeWidth={2} />
                  <span>Find Ranked NGO Matches</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Match Results Screen */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Empty State */}
          {!matchResult && !loading && (
            <div className="card-static p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF2ED] text-[#4A7C59] flex items-center justify-center mx-auto border border-[#D8E6DC]">
                <ShieldCheck className="w-8 h-8" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1D2921]">Ready to Find Your Best Match</h3>
              <p className="text-xs text-[#637367] max-w-sm mx-auto leading-relaxed">
                Click "Find Ranked NGO Matches" or choose a demo preset on the left to see algorithm scoring, proximity math, and shelter demand rationale.
              </p>
            </div>
          )}

          {/* Loader State */}
          {loading && (
            <div className="card-static p-12 text-center space-y-6 animate-pulse">
              <div className="w-12 h-12 border-3 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#1D2921]">Calculating Haversine Proximity & Scoring Urgency...</p>
                <p className="text-xs text-[#87968B]">Filtering shelter capacity limits in San Francisco</p>
              </div>
            </div>
          )}

          {/* Recycling Auto Route */}
          {matchResult && matchResult.isRecycling && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 rounded-[20px] p-8 border border-amber-200 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Recycle className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full badge-gradient-amber text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>AUTOMATIC TEXTILE RECYCLING ROUTE</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-amber-950">Diverted to Fiber Recovery Lab</h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Because this item has condition <strong>"Needs Repair"</strong>, our engine automatically diverts it from general shelter donation queues directly to our fiber recovery and upcycling studio to prevent landfill waste.
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateRecycling}
                className="btn-primary bg-amber-700 hover:bg-amber-800 text-white border-none w-full py-3.5"
              >
                <span>View Textile Recycling Directory</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Top 3 Ranked NGO Cards */}
          {matchResult && !matchResult.isRecycling && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1D2921]">Top 3 Ranked NGO Recipients</h3>
                  <p className="text-xs text-[#637367]">Ranked by proximity, size fit & capacity availability</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full badge-gradient-sage text-xs font-bold">
                  {matchResult.matches?.length || 0} Matches Calculated
                </span>
              </div>

              {matchResult.matches && matchResult.matches.map((m, index) => {
                const rankBadges = ['#1 Top Match', '#2 Strong Match', '#3 Suitable Match'];
                const isAccepted = acceptedNgoId === m.ngo.id;

                return (
                  <TiltCard
                    key={m.ngo.id}
                    className={`p-6 space-y-4 ${
                      index === 0 ? 'border-[#4A7C59]/40 ring-1 ring-[#4A7C59]/20' : ''
                    }`}
                  >
                    {/* Header: Rank + Animated Score Ring */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        index === 0 
                          ? 'bg-[#4A7C59] text-white shadow-sm' 
                          : 'bg-[#F0ECE1] text-[#1D2921] border border-[#E2DCD2]'
                      }`}>
                        {rankBadges[index]}
                      </span>

                      <AnimatedScoreRing score={m.score} />
                    </div>

                    {/* NGO Card details */}
                    <div className="flex items-start space-x-4">
                      <img
                        src={m.ngo.image_url}
                        alt={m.ngo.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#E2DCD2] shrink-0"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"; }}
                      />
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-[#1D2921]">{m.ngo.name}</h4>
                        <p className="text-xs text-[#637367] flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" strokeWidth={1.75} />
                          <span>{m.ngo.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* One-Line Reasoning Pill String */}
                    <div className="p-3.5 rounded-xl badge-gradient-sage text-xs font-semibold text-[#2F533A] flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#4A7C59] shrink-0" strokeWidth={1.75} />
                      <span>{m.reasoning}</span>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC]">
                      <div className="text-xs text-[#637367]">
                        Storage: <strong className="text-[#1D2921]">{m.ngo.current_storage}/{m.ngo.max_capacity}</strong> items
                      </div>

                      {isAccepted ? (
                        <div className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Matched & Reserved!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmDonation(m)}
                          className="btn-primary py-2.5 px-5 text-xs"
                        >
                          Confirm Donation
                        </button>
                      )}
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
