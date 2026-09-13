import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, MapPin, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Heart, Recycle, ArrowDown, Image as ImageIcon, X } from 'lucide-react';
import { ITEM_CATEGORIES } from '../constants/itemTypes';
import { API_BASE_URL } from '../config/api';
import Hero3DElement from './Hero3DElement';
import SystemFlowDiagram from './SystemFlowDiagram';
import TiltCard from './TiltCard';
import AnimatedScoreRing from './AnimatedScoreRing';
import BrandedLoader from './BrandedLoader';

const PRESET_IMAGES = [
  { label: 'Winter Puffer Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80', type: 'Jacket', size: 'L', gender: 'Men', condition: 'Gently Used' },
  { label: 'Bulk Mixed Bundle (Box)', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', type: 'Bulk Mixed (Men & Women) Bundle', size: 'Any', gender: 'Unisex', condition: 'Gently Used' },
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

export default function DonorPortal({ initialItem, onNavigateRecycling, onNavigateMyDonations, onItemDonated }) {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: 'Warm North Face Puffer Jacket',
    description: 'Navy blue insulated winter coat in pristine condition.',
    item_type: 'Jacket',
    size: 'L',
    gender: 'Men',
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

  React.useEffect(() => {
    if (initialItem && initialItem.id) {
      setSubmittedItem(initialItem);
      setLoading(true);
      fetch(`${API_BASE_URL}/api/items/${initialItem.id}/matches`)
        .then(res => res.json())
        .then(data => {
          setMatchResult(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching matches for item:', err);
          setLoading(false);
        });
    }
  }, [initialItem]);

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

    const token = localStorage.getItem('rethread_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      ...formData,
      quantity: Math.max(1, parseInt(formData.quantity, 10) || 1)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
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
    if (!submittedItem || !submittedItem.id) {
      console.error('No submitted item found to confirm recipient for.');
      return;
    }
    try {
      const token = localStorage.getItem('rethread_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/items/${submittedItem.id}/confirm`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ngoId: match.ngo.id })
      });
      if (!res.ok) {
        throw new Error(`Failed to confirm donation match: ${res.statusText}`);
      }
      const data = await res.json();

      setAcceptedNgoId(match.ngo.id);
      if (data && data.item) {
        setSubmittedItem(data.item);
      }
      if (onItemDonated) onItemDonated();
    } catch (err) {
      console.error('Error confirming donation:', err);
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-12 space-y-16 animate-fade-in">
      
      {/* 1. EDITORIAL HERO SECTION WITH FULL-BLEED CHARCOAL & 3D SPHERE */}
      <section className="bg-[#1A1A1A] rounded-sm p-8 sm:p-16 border border-[#333333] relative overflow-hidden text-[#F5F1E8]">
        
        {/* Layer 1: Gradient Mesh Blobs in Terracotta / Gold */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            animate={{ 
              x: [0, 25, -20, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            className="w-[480px] h-[480px] rounded-full bg-[#C1502E]/15 blur-[100px] absolute -top-30 -left-20"
          />
          <motion.div 
            animate={{ 
              x: [0, -20, 25, 0],
              y: [0, 25, -20, 0],
            }}
            transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
            className="w-[420px] h-[420px] rounded-full bg-[#D4A94A]/12 blur-[90px] absolute -bottom-20 -right-10"
          />
        </div>

        {/* Layer 2: Editorial Micro-Grid */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#D4A94A 1.2px, transparent 1.2px)`,
            backgroundSize: `24px 24px`
          }}
        />

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Hero Text - Bold Magazine Typography */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            
            <p className="editorial-label">01 — DONATE & ROUTE GARMENTS</p>

            <h1 className="font-serif text-5xl sm:text-7xl font-black tracking-tight text-[#F5F1E8] leading-[1.05]">
              Give clothing a <span className="italic text-[#C1502E]">second life</span> where it matters.
            </h1>

            <p className="text-sm sm:text-base text-[#AAAAAA] font-normal leading-[1.7] max-w-xl">
              ReThread pairs your extra wardrobe directly with local emergency shelters based on real-time urgency, proximity, and storage availability. Damaged items automatically route to certified textile recyclers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={scrollToForm}
                className="btn-primary w-full sm:w-auto px-8 py-3.5"
              >
                <span>START DONATION FORM</span>
                <ArrowDown className="w-4 h-4" strokeWidth={2} />
              </button>

              <button
                onClick={onNavigateMyDonations}
                className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider"
              >
                <span>MY DONATIONS</span>
              </button>
            </div>
          </div>

          {/* Right 3D Sphere Element */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="w-80 h-80 rounded-full bg-[#C1502E]/15 blur-[70px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <Hero3DElement />
          </div>

        </div>
      </section>

      {/* 2. SYSTEM FLOW DIAGRAM */}
      <SystemFlowDiagram />

      {/* 3. MAIN TWO-COLUMN GRID: FORM + MATCH RESULTS */}
      <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Card */}
        <div className="lg:col-span-6 card-light p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
            <div>
              <p className="editorial-label text-[#C1502E]">GARMENT SPECIFICATION</p>
              <h2 className="font-serif text-2xl font-black text-[#1A1A1A]">Donate a Garment</h2>
            </div>
            <button
              onClick={onNavigateMyDonations}
              className="text-xs font-bold uppercase tracking-wider text-[#4A7C59] hover:underline flex items-center space-x-1"
            >
              <span>My Donations →</span>
            </button>
          </div>

          {/* Demo Presets */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888] block mb-2">
              QUICK DEMO PRESETS:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-xs px-3.5 py-2 rounded-sm border font-bold uppercase tracking-wider transition-all ${
                    formData.photo_url === preset.url
                      ? 'bg-[#C1502E] text-white border-[#C1502E] shadow-sm'
                      : 'bg-[#EAE5DC] text-[#1A1A1A] border-[#DCD5C7] hover:bg-[#DDD6C6]'
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
              <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Garment Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-sm border border-[#DCD5C7] bg-white text-sm text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#C1502E] focus:outline-none transition-all"
                placeholder="e.g. Warm North Face Winter Jacket"
              />
            </div>

            {/* Photo Upload (Optional) + URL Fallback */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest">
                  Photo <span className="text-[#888888] font-normal lowercase">(optional)</span>
                </label>
                {formData.photo_url && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-700 hover:text-rose-900 flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-sm border border-[#DCD5C7] bg-white flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                  {formData.photo_url ? (
                    <img 
                      src={formData.photo_url} 
                      alt="Item Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"; }}
                    />
                  ) : (
                    <div className="text-center p-2 text-[#888888]">
                      <ImageIcon className="w-6 h-6 mx-auto mb-0.5" strokeWidth={1.5} />
                      <span className="text-[9px] font-bold uppercase block">No Photo</span>
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
                      className="btn-secondary py-2 px-3.5 text-[10px] tracking-wider inline-flex items-center space-x-2 cursor-pointer w-full justify-center text-[#1A1A1A] border-[#DCD5C7]"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C1502E]" strokeWidth={2} />
                      <span>Upload from Device</span>
                    </label>
                  </div>

                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-sm border border-[#DCD5C7] bg-white text-xs focus:ring-2 focus:ring-[#C1502E] focus:outline-none transition-all"
                    placeholder="Or paste image URL fallback"
                  />
                </div>
              </div>
            </div>

            {/* Categorized Garment Type, Size & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Garment Type</label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-sm border border-[#DCD5C7] bg-white text-xs font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C1502E] focus:outline-none"
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
                <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-sm border border-[#DCD5C7] bg-white text-xs font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C1502E] focus:outline-none"
                >
                  {['S', 'M', 'L', 'XL', 'Kids', 'Any'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-sm border border-[#DCD5C7] bg-white text-xs font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C1502E] focus:outline-none"
                >
                  {['Men', 'Women', 'Kids', 'Unisex'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition Select */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Condition</label>
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
                    className={`p-3 rounded-sm text-left border transition-all ${
                      formData.condition === cond.id
                        ? cond.id === 'Needs Repair'
                          ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold'
                          : 'bg-[#242424] border-[#C1502E] text-[#F5F1E8] font-bold'
                        : 'bg-white border-[#DCD5C7] text-[#666666] hover:bg-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider">{cond.id}</span>
                      {cond.id === 'Needs Repair' && <Recycle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[10px] mt-0.5 opacity-80">{cond.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Bulk Donation Batch Presets */}
            <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#E5DFD3] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest">
                    Garment Quantity / Batch Count
                  </label>
                  <p className="text-[10px] text-[#666666]">Donating multiple clothes at once? Select batch quantity below.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.quantity === '' ? '' : (formData.quantity || 1)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormData({ ...formData, quantity: '' });
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          setFormData({ ...formData, quantity: Math.min(parsed, 500) });
                        }
                      }
                    }}
                    onBlur={() => {
                      if (!formData.quantity || formData.quantity < 1) {
                        setFormData(prev => ({ ...prev, quantity: 1 }));
                      }
                    }}
                    className="w-20 px-3 py-1.5 rounded border border-[#C1502E] bg-white text-sm font-bold text-[#1A1A1A] text-center focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#1A1A1A]">items</span>
                </div>
              </div>

              {/* Quick Batch Quantity Chips */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#888888]">Quick Batch:</span>
                {[
                  { label: 'Single (1)', count: 1 },
                  { label: 'Box of 10', count: 10 },
                  { label: 'Bag of 25', count: 25 },
                  { label: 'Bulk 50', count: 50 },
                  { label: 'Drive 100+', count: 100 }
                ].map(batch => (
                  <button
                    key={batch.count}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quantity: batch.count }))}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      (formData.quantity || 1) === batch.count
                        ? 'bg-[#1E3A2B] text-white shadow-sm'
                        : 'bg-white border border-[#DCD5C7] text-[#666666] hover:bg-[#EAE5DC]'
                    }`}
                  >
                    {batch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-[10px] font-extrabold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Pickup Location</label>
              <select
                value={formData.donor_location_name}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm border border-[#DCD5C7] bg-white text-xs font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C1502E] focus:outline-none"
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
              className="btn-primary w-full py-3.5 text-xs tracking-[0.18em]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F5F1E8]" strokeWidth={2} />
                  <span>
                    {(formData.quantity || 1) > 1 
                      ? `PROCESS BULK DONATION OF ${formData.quantity} ITEMS` 
                      : 'FIND RANKED NGO MATCHES'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Match Results Screen */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Empty State */}
          {!matchResult && !loading && (
            <div className="card-dark p-12 text-center space-y-4 border border-[#333333]">
              <div className="w-14 h-14 rounded-sm bg-[#C1502E]/20 text-[#C1502E] border border-[#C1502E]/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-2xl font-black text-[#F5F1E8]">Ready to Calculate Matches</h3>
              <p className="text-xs text-[#AAAAAA] max-w-sm mx-auto leading-relaxed">
                Click "FIND RANKED NGO MATCHES" or select a preset to compute Haversine distance, urgency scores, and shelter capacities.
              </p>
            </div>
          )}

          {/* Loader State */}
          {loading && (
            <div className="card-dark p-12 text-center border border-[#333333]">
              <BrandedLoader text="COMPUTING PROXIMITY & URGENCY SCORES..." />
            </div>
          )}

          {/* Recycling Auto Route */}
          {matchResult && matchResult.isRecycling && (
            <div className="bg-[#242424] rounded-sm p-8 border border-amber-500/50 space-y-6 animate-fade-in text-[#F5F1E8]">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-sm bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Recycle className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1.5">
                  <span className="editorial-label text-amber-400">AUTOMATIC TEXTILE RECYCLING ROUTE</span>
                  <h3 className="font-serif text-2xl font-black text-[#F5F1E8]">Diverted to Fiber Recovery Lab</h3>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed">
                    Because this item has condition <strong>"Needs Repair"</strong>, our engine automatically diverts it directly to certified fiber upcycling labs to prevent landfill waste.
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateRecycling}
                className="btn-primary bg-amber-600 hover:bg-amber-700 text-white border-none w-full py-3.5"
              >
                <span>VIEW RECYCLING DIRECTORY</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Top 3 Ranked NGO Cards */}
          {matchResult && !matchResult.isRecycling && (
            <div className="space-y-6 animate-fade-in">
              
              {/* TRACKING BANNER */}
              <div className="bg-[#242424] p-4 rounded-sm border border-[#D4A94A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#D4A94A] shrink-0" strokeWidth={2} />
                  <span className="text-[#F5F1E8] font-medium leading-relaxed">
                    Track status & NGO delivery anytime in <strong>'My Donations'</strong>
                  </span>
                </div>
                {onNavigateMyDonations && (
                  <button
                    onClick={onNavigateMyDonations}
                    className="btn-secondary py-2 px-3.5 text-[10px] tracking-wider text-[#D4A94A] border-[#D4A94A]/40 shrink-0 self-start sm:self-center"
                  >
                    <span>MY DONATIONS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="editorial-label text-[#C1502E]">MATCHING ALGORITHM RESULTS</p>
                  <h3 className="font-serif text-2xl font-black text-[#F5F1E8]">Top 3 Ranked NGO Recipients</h3>
                </div>
                <span className="badge-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {matchResult.matches?.length || 0} MATCHES
                </span>
              </div>

              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                }}
                className="space-y-6"
              >
                {matchResult.matches && matchResult.matches.map((m, index) => {
                  const rankBadges = ['#01 TOP RANKED', '#02 STRONG FIT', '#03 SUITABLE FIT'];
                  const isAccepted = acceptedNgoId === m.ngo.id;

                  // Generate dynamic ranking rationale relative to positioning
                  let rankRationale = '';
                  if (index === 0) {
                    rankRationale = `#01 — Closest match (${m.distanceKm}km) with highest combined score: urgency + capacity + fit`;
                  } else if (index === 1) {
                    const topMatch = matchResult.matches[0];
                    if (m.distanceKm > topMatch.distanceKm) {
                      rankRationale = `#02 — Strong fit, but ${Math.round((m.distanceKm - topMatch.distanceKm) * 10) / 10}km farther than #1`;
                    } else {
                      rankRationale = `#02 — High compatibility, slightly lower urgency priority than #1`;
                    }
                  } else {
                    rankRationale = `#03 — Suitable fit; moderate distance (${m.distanceKm}km) and capacity balance`;
                  }

                  return (
                    <motion.div
                      key={m.ngo.id}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
                      }}
                    >
                      <TiltCard
                        style={{ backgroundColor: index === 0 ? '#222222' : '#1E1E1E' }}
                        className={`p-6 space-y-4 rounded-sm transition-all duration-300 ${
                          index === 0 
                            ? 'border-2 border-[#C1502E] shadow-[0_10px_30px_rgba(193,80,46,0.25)]' 
                            : 'border border-[#333333] hover:border-[#444444]'
                        }`}
                      >
                    {/* Header: Rank Badges + Animated Score Ring */}
                    <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm"
                          style={{
                            backgroundColor: index === 0 ? '#C1502E' : '#333333',
                            color: index === 0 ? '#FFFFFF' : '#888888'
                          }}
                        >
                          {rankBadges[index]}
                        </span>
                        <span 
                          className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-sm"
                          style={{
                            backgroundColor: '#2A1A14',
                            border: '1px solid #702E1B',
                            color: '#E07A5F'
                          }}
                        >
                          {m.ngo.type === 'individual' ? 'INDIVIDUAL' : m.ngo.type === 'community' ? 'COMMUNITY ORG' : 'NGO / SHELTER'}
                        </span>
                      </div>

                      <AnimatedScoreRing score={m.score} />
                    </div>

                    {/* Prominent Recipient Avatar, Name & Location */}
                    <div className="flex items-start space-x-4 pt-1">
                      <img 
                        src={m.ngo.image_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'} 
                        alt={m.ngo.name}
                        className="w-14 h-14 rounded-sm object-cover border border-[#3A3A3A] shrink-0"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"; }}
                      />
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 
                          className="font-serif text-2xl font-black tracking-tight leading-snug truncate text-[#FFFFFF]"
                          style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {m.ngo.name}
                        </h4>
                        <p 
                          className="text-xs flex items-center space-x-1.5 text-[#D1D5DB]"
                          style={{ color: '#D1D5DB' }}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C1502E]" strokeWidth={2} />
                          <span className="truncate text-[#D1D5DB]">{m.ngo.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Ranking Rationale Pill (Obsidian Dark with Gold Accent Left Border) */}
                    <div 
                      className="p-3 rounded-sm flex items-start space-x-2.5"
                      style={{
                        backgroundColor: '#141414',
                        borderLeft: '3px solid #D4A94A',
                        borderTop: '1px solid #282828',
                        borderRight: '1px solid #282828',
                        borderBottom: '1px solid #282828'
                      }}
                    >
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D4A94A' }} strokeWidth={2} />
                      <span className="text-xs font-semibold leading-relaxed text-[#F9FAFB]">{rankRationale}</span>
                    </div>

                    {/* Match Attributes Breakdown Pill */}
                    <div 
                      className="p-3 rounded-sm flex items-center space-x-2.5"
                      style={{
                        backgroundColor: '#181818',
                        border: '1px solid #2A2A2A'
                      }}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#D4A94A' }} strokeWidth={1.75} />
                      <span className="text-xs font-medium text-[#E5E7EB]">{m.reasoning}</span>
                    </div>

                    {/* Storage Progress Bar & Footer Row */}
                    <div className="pt-3 border-t border-[#2C2C2C] space-y-3">
                      
                      {/* Storage Bar Indicator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#9CA3AF]">Shelter Capacity Available</span>
                          <span className="text-[#F9FAFB] font-extrabold" style={{ color: '#F9FAFB' }}>
                            {m.ngo?.current_storage ?? 0} / {m.ngo?.max_capacity ?? 100} items
                          </span>
                        </div>
                        <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#2C2C2C]">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.round(((m.ngo?.current_storage ?? 0) / (m.ngo?.max_capacity || 100)) * 100))}%`,
                              backgroundColor: index === 0 ? '#C1502E' : '#D4A94A'
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button Row */}
                      <div className="flex items-center justify-end pt-1">
                        {isAccepted ? (
                          <div 
                            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: '#192617',
                              borderColor: '#7A9471',
                              color: '#8FB884'
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>MATCH CONFIRMED!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmDonation(m)}
                            className="btn-primary w-full sm:w-auto py-2.5 px-6 text-[10px] tracking-widest font-black"
                          >
                            CONFIRM DONATION
                          </button>
                        )}
                      </div>

                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
