import React, { useEffect, useState } from 'react';
import { Heart, ShieldCheck, Flame, MapPin, Users, Scale, Building, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_BASE_URL } from '../config/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ImpactDashboard() {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/impact`)
      .then(res => res.json())
      .then(data => {
        setImpactData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading impact stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !impactData) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#637367]">Loading Community Impact & Demand Map...</p>
      </div>
    );
  }

  const { stats, hotspots } = impactData;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      
      {/* Hero Stat Banner */}
      <div className="bg-gradient-to-b from-[#2F533A] to-[#1D2921] rounded-[24px] p-10 sm:p-14 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#EBF2ED] text-xs font-semibold backdrop-blur-md">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>COMMUNITY REDISTRIBUTION METRICS</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15]">
            Your donations have helped <span className="text-[#EBF2ED] underline decoration-[#4A7C59] decoration-wavy">{stats.familiesHelped} families</span> stay warm & dignified.
          </h1>

          <p className="text-base sm:text-lg text-[#EBF2ED]/90 font-normal leading-[1.6]">
            Every garment uploaded to ReThread bypasses landfill waste and is intelligently routed to local emergency shelters with real-time zero-waste capacity management.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="card-elevated p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-[#637367] block">Families Helped</span>
          <span className="font-serif text-3xl font-bold text-[#1D2921]">{stats.familiesHelped}</span>
          <p className="text-[11px] text-emerald-700 font-bold">+12 this week</p>
        </div>

        <div className="card-elevated p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF2ED] text-[#4A7C59] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-[#637367] block">Items Redistributed</span>
          <span className="font-serif text-3xl font-bold text-[#1D2921]">{stats.itemsRedistributed}</span>
          <p className="text-[11px] text-[#637367]">Matched & accepted</p>
        </div>

        <div className="card-elevated p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Scale className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-[#637367] block">Kg Waste Diverted</span>
          <span className="font-serif text-3xl font-bold text-[#1D2921]">{Math.round(stats.kgWasteDiverted)} kg</span>
          <p className="text-[11px] text-amber-700 font-bold">Textiles saved from landfill</p>
        </div>

        <div className="card-elevated p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF2ED] text-[#2F533A] flex items-center justify-center">
            <Building className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-[#637367] block">Active Shelter Partners</span>
          <span className="font-serif text-3xl font-bold text-[#1D2921]">{stats.activeNgosCount} Shelters</span>
          <p className="text-[11px] text-[#4A7C59] font-bold">San Francisco Bay Area</p>
        </div>

      </div>

      {/* Demand Hotspot Map View */}
      <div className="card-static p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-500" strokeWidth={2} />
              <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Real-Time Demand Hotspot Map</h2>
            </div>
            <p className="text-xs text-[#637367] mt-0.5">
              Map colors represent local shelter demand intensity & urgency levels
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E2DCD2] text-xs font-bold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-rose-950">High Urgency</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-amber-950">Moderate Demand</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-emerald-950">Low / Fulfilled</span>
            </div>
          </div>
        </div>

        {/* Leaflet Map Box */}
        <div className="h-[440px] w-full rounded-2xl overflow-hidden border border-[#E2DCD2] relative shadow-inner">
          <MapContainer
            center={[37.7780, -122.4150]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hotspots.map((h) => {
              const color = h.intensity === 'high' ? '#f43f5e' : h.intensity === 'medium' ? '#f59e0b' : '#10b981';

              return (
                <React.Fragment key={h.id}>
                  {/* Outer Pulsing Demand Ring for Urgent Needs */}
                  {h.intensity === 'high' && (
                    <CircleMarker
                      center={[h.latitude, h.longitude]}
                      radius={32}
                      pathOptions={{
                        color: '#f43f5e',
                        fillColor: '#f43f5e',
                        fillOpacity: 0.15,
                        weight: 1.5,
                        dashArray: '4 4'
                      }}
                    />
                  )}

                  <CircleMarker
                    center={[h.latitude, h.longitude]}
                    radius={h.intensity === 'high' ? 22 : 16}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  />

                  <Marker position={[h.latitude, h.longitude]}>
                    <Popup>
                      <div className="p-1 space-y-1 max-w-xs font-sans">
                        <h4 className="font-serif font-bold text-sm text-gray-900">{h.name}</h4>
                        <p className="text-xs text-gray-600">
                          Open Demand: <strong className="text-gray-900">{h.openDemand} items</strong>
                        </p>
                        <p className="text-xs text-gray-600">
                          Storage Occupancy: <strong className="text-gray-900">{h.capacityRatio}%</strong>
                        </p>
                        <div className="pt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.intensity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {h.urgentCount} Urgent Needs Active
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Hotspots Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {hotspots.map((h) => (
            <div key={h.id} className="card-elevated p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#1D2921] truncate">{h.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  h.intensity === 'high' ? 'badge-gradient-rose' : 'badge-gradient-sage'
                }`}>
                  {h.intensity.toUpperCase()} DEMAND
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#637367]">
                <span>Open Items Needed:</span>
                <strong className="text-[#1D2921]">{h.openDemand}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-[#637367]">
                <span>Storage Occupancy:</span>
                <strong className="text-[#1D2921]">{h.capacityRatio}%</strong>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
