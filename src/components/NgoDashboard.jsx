import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle2, XCircle, AlertCircle, PackageCheck, Layers, Settings, Trash2, ShieldAlert } from 'lucide-react';
import { ITEM_CATEGORIES } from '../constants/itemTypes';

export default function NgoDashboard({ onDataUpdated }) {
  const [ngos, setNgos] = useState([]);
  const [selectedNgoId, setSelectedNgoId] = useState(1);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [incomingMatches, setIncomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Need Form Modal
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [newNeed, setNewNeed] = useState({
    item_type: 'Jacket',
    size: 'L',
    gender: 'Men',
    season: 'Winter',
    quantity_needed: 10,
    urgency: 'High',
    notes: 'Urgent winter outerwear request'
  });

  // Capacity edit state
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [capacityInput, setCapacityInput] = useState('');

  const fetchNgoData = async () => {
    try {
      const res = await fetch('/api/ngos');
      const data = await res.json();
      setNgos(data);

      const curr = data.find(n => n.id === Number(selectedNgoId)) || data[0];
      if (curr) {
        setSelectedNgo(curr);
        setCapacityInput(curr.max_capacity);
      }

      if (curr) {
        const matchRes = await fetch(`/api/ngo-matches/${curr.id}`);
        const matchesData = await matchRes.json();
        setIncomingMatches(matchesData);
      }
    } catch (err) {
      console.error('Error fetching NGO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [selectedNgoId]);

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/ngos/${selectedNgoId}/capacity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_capacity: Number(capacityInput) })
      });
      if (res.ok) {
        setEditingCapacity(false);
        fetchNgoData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      console.error('Failed to update capacity:', err);
    }
  };

  const handleAddNeed = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/ngos/${selectedNgoId}/needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNeed)
      });
      if (res.ok) {
        setShowNeedModal(false);
        fetchNgoData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      console.error('Failed to add need:', err);
    }
  };

  const handleDeleteNeed = async (needId) => {
    try {
      await fetch(`/api/ngos/needs/${needId}`, { method: 'DELETE' });
      fetchNgoData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/accept`, { method: 'POST' });
      if (res.ok) {
        fetchNgoData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      console.error('Error accepting match:', err);
    }
  };

  const handleDeclineMatch = async (matchId) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/decline`, { method: 'POST' });
      if (res.ok) {
        fetchNgoData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      console.error('Error declining match:', err);
    }
  };

  if (loading || !selectedNgo) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#637367]">Loading NGO Dashboard...</p>
      </div>
    );
  }

  const capacityRatio = Math.round((selectedNgo.current_storage / selectedNgo.max_capacity) * 100);
  const isCapacityHigh = capacityRatio >= 80;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      
      {/* Header & Selector */}
      <div className="card-static p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={selectedNgo.image_url}
            alt={selectedNgo.name}
            className="w-18 h-18 rounded-2xl object-cover border border-[#E2DCD2] shadow-sm shrink-0"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"; }}
          />
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full badge-gradient-sage text-xs font-bold">
              VERIFIED RECIPIENT SHELTER
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#1D2921]">{selectedNgo.name}</h1>
            <p className="text-xs text-[#637367]">{selectedNgo.address}</p>
          </div>
        </div>

        {/* NGO Switcher */}
        <div className="w-full md:w-80 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E2DCD2] space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#637367] block">
            Select Shelter Portal:
          </label>
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-white text-xs font-bold text-[#1D2921] focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
          >
            {ngos.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 1: Storage Capacity Meter & Needs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Storage Capacity Meter Card */}
        <div className="md:col-span-6 card-static p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF2ED] text-[#4A7C59] flex items-center justify-center">
                <Layers className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1D2921]">Storage Capacity</h3>
                <p className="text-xs text-[#637367]">Current inventory threshold</p>
              </div>
            </div>

            <button
              onClick={() => setEditingCapacity(!editingCapacity)}
              className="p-2 rounded-xl text-[#637367] hover:bg-[#FAF8F5] transition-colors"
              title="Edit Capacity Limit"
            >
              <Settings className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {editingCapacity ? (
            <form onSubmit={handleUpdateCapacity} className="flex items-center space-x-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E2DCD2]">
              <input
                type="number"
                min="10"
                max="5000"
                value={capacityInput}
                onChange={(e) => setCapacityInput(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E2DCD2] bg-white text-xs font-bold focus:outline-none"
              />
              <button
                type="submit"
                className="btn-primary py-2 px-4 text-xs shrink-0"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-[#637367]">Occupied Inventory</span>
                <span className="font-bold text-[#1D2921]">
                  {selectedNgo.current_storage} / {selectedNgo.max_capacity} items ({capacityRatio}%)
                </span>
              </div>

              <div className="w-full bg-[#F0ECE1] h-3.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCapacityHigh ? 'bg-amber-500' : 'bg-[#4A7C59]'
                  }`}
                  style={{ width: `${Math.min(100, capacityRatio)}%` }}
                />
              </div>

              {isCapacityHigh && (
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Storage limit near max! Algorithm will adjust matching priority to prevent shelter overflow.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Needs Overview Card */}
        <div className="md:col-span-6 card-static p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF2ED] text-[#4A7C59] flex items-center justify-center">
                <PackageCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1D2921]">Needs Overview</h3>
                <p className="text-xs text-[#637367]">Active requests posted for donors</p>
              </div>
            </div>

            <button
              onClick={() => setShowNeedModal(true)}
              className="btn-primary py-2.5 px-4 text-xs"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Post New Need</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD2]">
              <span className="text-xs text-[#637367] font-medium block mb-1">Total Needs</span>
              <span className="font-serif text-2xl font-bold text-[#1D2921]">{selectedNgo.needs?.length || 0}</span>
            </div>
            <div className="p-4 rounded-2xl badge-gradient-rose">
              <span className="text-xs font-medium block mb-1">High Urgency</span>
              <span className="font-serif text-2xl font-bold">
                {selectedNgo.needs?.filter(n => n.urgency === 'High' && n.status === 'active').length || 0}
              </span>
            </div>
            <div className="p-4 rounded-2xl badge-gradient-sage">
              <span className="text-xs font-medium block mb-1">Fulfilled</span>
              <span className="font-serif text-2xl font-bold">
                {selectedNgo.needs?.reduce((acc, n) => acc + (n.quantity_fulfilled || 0), 0) || 0}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Incoming Matched Donations Queue */}
      <div className="card-static p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Incoming Matched Donations</h2>
            <p className="text-xs text-[#637367] mt-0.5">Review items matched by algorithm. Click Accept to decrement requested item count</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-[#4A7C59] text-white text-xs font-bold shadow-sm">
            {incomingMatches.length} Pending
          </span>
        </div>

        {incomingMatches.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E2DCD2]">
            <CheckCircle2 className="w-8 h-8 text-[#87968B] mx-auto" strokeWidth={1.75} />
            <p className="text-sm font-bold text-[#1D2921]">No pending incoming donations</p>
            <p className="text-xs text-[#637367]">Upload a new item in the Donor Portal tab to trigger real-time matching!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomingMatches.map((match) => (
              <div key={match.id} className="card-elevated p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={match.photo_url}
                    alt={match.item_title}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#E2DCD2] shrink-0 shadow-sm"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80"; }}
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full badge-gradient-sage text-[10px] font-bold">
                        {match.match_score}% Match Score
                      </span>
                      <span className="text-[11px] font-bold text-[#637367]">{match.distance_km}km away</span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-[#1D2921] truncate">{match.item_title}</h4>
                    <p className="text-xs text-[#637367]">
                      Condition: <strong>{match.condition}</strong> • Size: <strong>{match.size}</strong> ({match.gender})
                    </p>
                    <p className="text-[11px] text-[#87968B]">Donor: {match.donor_name} ({match.donor_location_name})</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2DCD2] text-xs text-[#2F533A]">
                  <strong>Reasoning:</strong> {match.reasoning}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handleAcceptMatch(match.id)}
                    className="btn-primary flex-1 py-2.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#EBF2ED]" strokeWidth={2} />
                    <span>Accept Donation</span>
                  </button>

                  <button
                    onClick={() => handleDeclineMatch(match.id)}
                    className="btn-secondary py-2.5 px-4 text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1.75} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Active NGO Needs List */}
      <div className="card-static p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Posted Needs List</h2>
            <p className="text-xs text-[#637367] mt-0.5">Active garment requests for {selectedNgo.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedNgo.needs && selectedNgo.needs.map((need) => {
            const remaining = Math.max(0, need.quantity_needed - (need.quantity_fulfilled || 0));
            const isClosed = remaining === 0 || need.status === 'closed';

            return (
              <div
                key={need.id}
                className={`card-elevated p-6 space-y-3 ${
                  isClosed ? 'opacity-70 bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    need.urgency === 'High'
                      ? 'badge-gradient-rose'
                      : need.urgency === 'Medium'
                      ? 'badge-gradient-amber'
                      : 'badge-gradient-sage'
                  }`}>
                    {need.urgency} Urgency
                  </span>

                  <button
                    onClick={() => handleDeleteNeed(need.id)}
                    className="text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>

                <h4 className="font-serif text-lg font-bold text-[#1D2921]">
                  {need.item_type} ({need.size})
                </h4>
                <p className="text-xs text-[#637367]">Category: {need.gender} • {need.season}</p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>Fulfilled Progress</span>
                    <span className={isClosed ? 'text-emerald-700 font-bold' : 'text-[#1D2921] font-bold'}>
                      {need.quantity_fulfilled} / {need.quantity_needed} items
                    </span>
                  </div>
                  <div className="w-full bg-[#F0ECE1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isClosed ? 'bg-emerald-600' : 'bg-[#4A7C59]'
                      }`}
                      style={{ width: `${Math.min(100, Math.round(((need.quantity_fulfilled || 0) / need.quantity_needed) * 100))}%` }}
                    />
                  </div>
                </div>

                {isClosed ? (
                  <div className="bg-emerald-100 text-emerald-800 py-2 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Need Fulfilled & Closed</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#637367] italic pt-1">{need.notes || 'No extra notes provided.'}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Need Modal */}
      {showNeedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-static p-8 max-w-md w-full space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#1D2921]">Post New Item Need</h3>
              <button
                onClick={() => setShowNeedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNeed} className="space-y-4">
              {/* EXPANDED ITEM TYPE DROPDOWN FOR NGO MODAL */}
              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Item Type</label>
                <select
                  value={newNeed.item_type}
                  onChange={(e) => setNewNeed({ ...newNeed, item_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Size</label>
                  <select
                    value={newNeed.size}
                    onChange={(e) => setNewNeed({ ...newNeed, size: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold"
                  >
                    {['S', 'M', 'L', 'XL', 'Kids', 'Any'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={newNeed.quantity_needed}
                    onChange={(e) => setNewNeed({ ...newNeed, quantity_needed: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Gender</label>
                  <select
                    value={newNeed.gender}
                    onChange={(e) => setNewNeed({ ...newNeed, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold"
                  >
                    {['Men', 'Women', 'Kids', 'Unisex'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Urgency</label>
                  <select
                    value={newNeed.urgency}
                    onChange={(e) => setNewNeed({ ...newNeed, urgency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs font-semibold"
                  >
                    {['High', 'Medium', 'Low'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D2921] uppercase mb-1">Notes</label>
                <input
                  type="text"
                  value={newNeed.notes}
                  onChange={(e) => setNewNeed({ ...newNeed, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F5] text-xs"
                  placeholder="Specific request notes..."
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNeedModal(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 text-xs"
                >
                  Post Need
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
