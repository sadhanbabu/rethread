import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Users, MapPin, Sparkles, CheckCircle2, ShieldCheck, Mail, Phone, Home, Package } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function FinderRegistrationModal({ finderType, onClose, onSuccess }) {
  const isIndividual = finderType === 'individual';
  const isCommunity = finderType === 'community';

  const nameLabel = isIndividual 
    ? 'Full Name' 
    : 'Organization Name';

  const namePlaceholder = isIndividual
    ? 'e.g. Priya Sharma'
    : isCommunity
    ? 'e.g. Bay Area Community Closet'
    : 'e.g. Hope Haven Shelter';

  const [formData, setFormData] = useState({
    displayName: '',
    location: 'Mission District, San Francisco',
    max_capacity: isIndividual ? 5 : 400,
    contact_email: '',
    phone: '',
    description: isIndividual ? 'Individual clothing recipient request' : `${finderType.toUpperCase()} organization profile`
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setError(`Please enter your ${nameLabel.toLowerCase()}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/finders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finderType,
          displayName: formData.displayName.trim(),
          address: formData.location,
          max_capacity: Number(formData.max_capacity),
          contact_email: formData.contact_email,
          phone: formData.phone,
          description: formData.description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register profile');
      }

      // Success -> trigger immediate login callback
      onSuccess(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error registering profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card-dark p-8 max-w-lg w-full space-y-6 border border-[#333333] shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-4">
          <div className="space-y-1">
            <span className="badge-terracotta px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              REGISTER NEW {finderType.toUpperCase()} PROFILE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#F5F1E8]">
              Create Recipient Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#F5F1E8] p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-sm text-xs font-bold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TYPE-SPECIFIC NAME FIELD */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#F5F1E8] uppercase tracking-widest mb-1.5">
              {nameLabel} <span className="text-[#C1502E]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={namePlaceholder}
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-sm border border-[#333333] bg-[#1A1A1A] text-xs font-bold text-[#F5F1E8] focus:border-[#C1502E] focus:outline-none"
            />
            <p className="text-[10px] text-[#888888] mt-1">
              {isIndividual 
                ? "This is your personal full name as displayed to clothing donors." 
                : "Official registered name of your shelter or organization."}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#F5F1E8] uppercase tracking-widest mb-1.5">
              Neighborhood / Address <span className="text-[#C1502E]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Mission District, San Francisco"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm border border-[#333333] bg-[#1A1A1A] text-xs font-bold text-[#F5F1E8] focus:border-[#C1502E] focus:outline-none pl-9"
              />
              <MapPin className="w-4 h-4 text-[#C1502E] absolute left-3 top-3" />
            </div>
          </div>

          {/* Household Size vs Storage Capacity */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#F5F1E8] uppercase tracking-widest mb-1.5">
              {isIndividual ? 'Household Size (Members)' : 'Storage Inventory Capacity'}
            </label>
            <input
              type="number"
              min="1"
              max={isIndividual ? 15 : 5000}
              value={formData.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-sm border border-[#333333] bg-[#1A1A1A] text-xs font-bold text-[#F5F1E8] focus:border-[#C1502E] focus:outline-none"
            />
          </div>

          {/* Contact Details (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-[#888888] uppercase tracking-widest mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="contact@domain.org"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 rounded-sm border border-[#333333] bg-[#1A1A1A] text-xs text-[#F5F1E8]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-[#888888] uppercase tracking-widest mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                placeholder="(415) 555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-sm border border-[#333333] bg-[#1A1A1A] text-xs text-[#F5F1E8]"
              />
            </div>
          </div>

          {/* Verification Badge Preview */}
          <div className="p-3 bg-[#1A1A1A] rounded-sm border border-[#333333] flex items-center justify-between text-xs">
            <span className="text-[#AAAAAA]">Verification Status:</span>
            <span className="px-2.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider">
              Verification Pending (Demo Mode)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 text-xs"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-3 text-xs tracking-wider"
            >
              {submitting ? 'CREATING...' : 'CREATE & LOG IN'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
