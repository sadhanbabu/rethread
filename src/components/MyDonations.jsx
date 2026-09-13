import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Clock, Recycle, ArrowRight, MapPin, Building2, Sparkles, Factory } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import TiltCard from './TiltCard';

export default function MyDonations({ onNavigateDonate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    const token = localStorage.getItem('rethread_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/api/items`, { headers })
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching my donations:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#637367]">Loading Donation Journey Tracker...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      
      {/* Hero Header */}
      <div className="card-static p-8 sm:p-10 bg-gradient-to-b from-[#F0ECE1] to-[#F9F6F0] border border-[#E2DCD2] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full badge-gradient-sage text-xs font-semibold">
              <Package className="w-4 h-4 text-[#4A7C59]" strokeWidth={1.75} />
              <span>PERSONAL DONOR PORTAL — TRACKING JOURNEY</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1D2921]">My Donated Garments</h1>
            <p className="text-xs sm:text-sm text-[#637367]">
              Track the real-time status, shelter recipient, and end-state material recycling outcomes of your donated apparel.
            </p>
          </div>

          <button
            onClick={onNavigateDonate}
            className="btn-primary py-3 px-6 text-xs self-start sm:self-center"
          >
            <span>+ Donate New Item</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {(() => {
        // Only show items that have a confirmed recipient or are routed to recycling
        const confirmedItems = items.filter(item => {
          const isRecycling = item.status === 'routed_recycling' || item.condition === 'Needs Repair';
          const hasRecipient = Boolean(item.confirmed_ngo_id || item.recipientNgo || item.status === 'matched' || item.status === 'accepted');
          return isRecycling || hasRecipient;
        });

        if (confirmedItems.length === 0) {
          return (
            <div className="card-static p-16 text-center space-y-4">
              <Package className="w-12 h-12 text-[#87968B] mx-auto" strokeWidth={1.5} />
              <h3 className="font-serif text-xl font-bold text-[#1D2921]">No Confirmed Donations Yet</h3>
              <p className="text-xs text-[#637367] max-w-sm mx-auto">
                Once you select and confirm a recipient shelter for your garment on the donation page, it will appear here in your tracking portal!
              </p>
              <button onClick={onNavigateDonate} className="btn-primary text-xs py-2.5 px-5">
                Donate Now
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {confirmedItems.map((indexItem, index) => {
              const item = indexItem;
              const isRecycling = item.status === 'routed_recycling' || item.condition === 'Needs Repair';
              const isAccepted = item.status === 'accepted';
              const isMatched = item.status === 'matched' || Boolean(item.confirmed_ngo_id || item.recipientNgo);

              // Determine Status Badge & Stepper Phase
              let statusBadge = {
                label: `Matched — Awaiting Acceptance from ${item.recipientNgo || 'Selected Shelter'}`,
                bgColor: 'badge-gradient-amber',
                icon: Clock,
                step: 2
              };

              if (isAccepted) {
                statusBadge = {
                  label: `Accepted — Distributed to ${item.recipientNgo || 'Local Recipient'}`,
                  bgColor: 'badge-gradient-sage',
                  icon: CheckCircle2,
                  step: 3
                };
              } else if (isRecycling) {
                statusBadge = {
                  label: item.recycling_outcome || 'Recycled — Converted to 2.4 kg of insulation fiber',
                  bgColor: 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm',
                  icon: Recycle,
                  step: 3
                };
              }

              const StatusIcon = statusBadge.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <TiltCard className="p-8 space-y-6">
                  
                  {/* Top Row: Item Details & Status Badge */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
                    <div className="flex items-start space-x-5">
                      <img
                        src={item.photo_url}
                        alt={item.title}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#E2DCD2] shadow-sm shrink-0"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"; }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#87968B]">
                            ID #{item.id} • {item.condition}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#1D2921]">{item.title}</h3>
                        <p className="text-xs text-[#637367]">
                          Type: <strong>{item.item_type}</strong> • Size: <strong>{item.size}</strong> ({item.gender})
                        </p>
                        <p className="text-[11px] text-[#87968B] flex items-center space-x-1 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#4A7C59]" strokeWidth={1.75} />
                          <span>Submitted from {item.donor_location_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="self-start md:self-center shrink-0 max-w-md">
                      <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold ${statusBadge.bgColor}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" strokeWidth={2} />
                        <span className="leading-snug">{statusBadge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Stepper Progress Visualization */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#637367]">
                      Donation Journey Stepper:
                    </span>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      
                      {/* Step 1: Submitted */}
                      <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-1">
                        <div className="flex items-center justify-center space-x-1 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>1. Submitted</span>
                        </div>
                        <p className="text-[10px] text-emerald-700">Garment registered</p>
                      </div>

                      {/* Step 2: Matched */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        statusBadge.step >= 2
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#87968B]'
                      }`}>
                        <div className="flex items-center justify-center space-x-1 text-xs font-bold">
                          <CheckCircle2 className={`w-4 h-4 ${statusBadge.step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span>2. Matched / Routed</span>
                        </div>
                        <p className="text-[10px] text-emerald-700">
                          {isRecycling ? 'Routed to Fiber Partner' : 'Scored top shelters'}
                        </p>
                      </div>

                      {/* Step 3: Delivered / Recycled */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        statusBadge.step >= 3
                          ? isRecycling
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-[#FAF8F5] border-[#E2DCD2] text-[#87968B]'
                      }`}>
                        <div className="flex items-center justify-center space-x-1 text-xs font-bold">
                          {statusBadge.step >= 3 ? (
                            isRecycling ? <Recycle className="w-4 h-4 text-emerald-700" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                          <span>
                            {isRecycling ? '3. Recycled Final State' : '3. NGO Accepted'}
                          </span>
                        </div>
                        <p className="text-[10px]">
                          {statusBadge.step >= 3
                            ? isRecycling ? 'Fiber outcome finalized' : 'Delivered & Stored'
                            : 'Awaiting shelter response'}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Row: Recipient & Rationale Context */}
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E2DCD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      {isRecycling ? (
                        <Factory className="w-4 h-4 text-[#C1502E]" strokeWidth={1.75} />
                      ) : (
                        <Building2 className="w-4 h-4 text-[#4A7C59]" strokeWidth={1.75} />
                      )}
                      <span className="text-[#637367]">
                        Destination Partner:{' '}
                        <strong className="text-[#1D2921]">
                          {isRecycling
                            ? (item.recycling_partner_name || 'Bay Area Fiber Recovery & Shredding Lab')
                            : (item.recipientNgo || 'Confirmed Shelter')}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[#2F533A] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#4A7C59]" />
                      <span>
                        {isRecycling 
                          ? (item.recycling_outcome || 'Recycled into 2.4 kg insulation material')
                          : 'Recipient confirmed — awaiting acceptance'}
                      </span>
                    </div>
                  </div>

                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      );
      })()}

  </div>
  );
}
