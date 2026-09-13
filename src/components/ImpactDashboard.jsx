import React, { useEffect, useState } from 'react';
import { Heart, ShieldCheck, Flame, MapPin, Users, Scale, Building, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import CountUpNumber from './CountUpNumber';
import BrandedLoader from './BrandedLoader';

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
    const token = localStorage.getItem('rethread_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/api/impact`, { headers })
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
      <div className="max-w-[1300px] mx-auto px-6 py-24 text-center">
        <BrandedLoader text="LOADING PERSONAL IMPACT & COMMUNITY MAP..." />
      </div>
    );
  }

  const { stats, hotspots, isPersonalized } = impactData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-12 space-y-12">
      
      {/* Hero Stat Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#1A1A1A] rounded-sm p-10 sm:p-14 text-[#F5F1E8] border border-[#333333] relative overflow-hidden"
      >
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#C1502E]/20 border border-[#C1502E]/40 text-[#E6C687] text-xs font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPersonalized ? "LOGGED-IN DONOR PERSONAL IMPACT" : "GLOBAL PLATFORM METRICS"}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            {isPersonalized ? (
              <>
                You have donated <span className="text-[#C1502E] italic"><CountUpNumber value={stats.totalDonated || 0} suffix={stats.totalDonated === 1 ? " item" : " items"} /></span> to community clothing drives.
              </>
            ) : (
              <>
                Your donations have helped <span className="text-[#C1502E] italic"><CountUpNumber value={stats.familiesHelped} suffix=" families" /></span> stay warm & dignified.
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#AAAAAA] font-normal leading-[1.7]">
            {isPersonalized 
              ? "Numeric metrics below are personalized specifically to your account's donation history, while the map view displays active platform-wide shelter demand hotspots."
              : "Every garment uploaded to ReThread bypasses landfill waste and is intelligently routed to local emergency shelters with real-time zero-waste capacity management."}
          </p>
        </div>
      </motion.div>

      {/* 4 Personalized Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        
        <motion.div variants={itemVariants} className="card-dark p-6 space-y-3 border border-[#333333]">
          <div className="w-10 h-10 rounded-sm bg-[#C1502E]/20 text-[#C1502E] border border-[#C1502E]/40 flex items-center justify-center">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <p className="editorial-label text-[9px] text-[#888888]">YOU'VE DONATED</p>
          <span className="font-serif text-4xl font-black text-[#F5F1E8]">
            <CountUpNumber value={stats.totalDonated || 0} suffix=" items" />
          </span>
          <p className="text-[10px] text-[#7A9471] font-bold uppercase tracking-wider">Your Total Submissions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="card-dark p-6 space-y-3 border border-[#333333]">
          <div className="w-10 h-10 rounded-sm bg-[#D4A94A]/20 text-[#D4A94A] border border-[#D4A94A]/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <p className="editorial-label text-[9px] text-[#888888]">RECIPIENT DISTRIBUTED</p>
          <span className="font-serif text-4xl font-black text-[#F5F1E8]">
            <CountUpNumber value={stats.itemsRedistributed || 0} suffix=" items" />
          </span>
          <p className="text-[10px] text-[#AAAAAA]">Accepted by NGOs</p>
        </motion.div>

        <motion.div variants={itemVariants} className="card-dark p-6 space-y-3 border border-[#333333]">
          <div className="w-10 h-10 rounded-sm bg-[#C1502E]/20 text-[#C1502E] border border-[#C1502E]/40 flex items-center justify-center">
            <Scale className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <p className="editorial-label text-[9px] text-[#888888]">ROUTED TO RECYCLING</p>
          <span className="font-serif text-4xl font-black text-[#F5F1E8]">
            <CountUpNumber value={stats.itemsRecycled || 0} suffix=" items" />
          </span>
          <p className="text-[10px] text-[#D4A94A] font-bold uppercase tracking-wider">Fiber Recovery Labs</p>
        </motion.div>

        <motion.div variants={itemVariants} className="card-dark p-6 space-y-3 border border-[#333333]">
          <div className="w-10 h-10 rounded-sm bg-[#D4A94A]/20 text-[#D4A94A] border border-[#D4A94A]/40 flex items-center justify-center">
            <Building className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <p className="editorial-label text-[9px] text-[#888888]">WASTE DIVERTED</p>
          <span className="font-serif text-4xl font-black text-[#F5F1E8]">
            <CountUpNumber value={Math.round(stats.kgWasteDiverted || 0)} suffix=" kg" />
          </span>
          <p className="text-[10px] text-[#7A9471] font-bold uppercase tracking-wider">Saved from landfill</p>
        </motion.div>

      </motion.div>

      {/* Demand Hotspot Map View */}
      <div className="card-dark p-8 space-y-6 border border-[#333333]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#333333] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-[#C1502E]" strokeWidth={2} />
              <h2 className="font-serif text-3xl font-black text-[#F5F1E8]">Real-Time Demand Hotspot Map</h2>
            </div>
            <p className="text-xs text-[#AAAAAA] mt-0.5">
              Map indicators represent local shelter demand intensity & urgency levels
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 bg-[#1A1A1A] px-4 py-2.5 rounded-sm border border-[#333333] text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#C1502E]" />
              <span className="text-[#F5F1E8]">High Urgency</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D4A94A]" />
              <span className="text-[#F5F1E8]">Moderate</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#7A9471]" />
              <span className="text-[#F5F1E8]">Low</span>
            </div>
          </div>
        </div>

        {/* Leaflet Map Box */}
        <div className="h-[440px] w-full rounded-sm overflow-hidden border border-[#333333] relative">
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
              const color = h.intensity === 'high' ? '#C1502E' : h.intensity === 'medium' ? '#D4A94A' : '#7A9471';

              return (
                <React.Fragment key={h.id}>
                  {h.intensity === 'high' && (
                    <CircleMarker
                      center={[h.latitude, h.longitude]}
                      radius={32}
                      pathOptions={{
                        color: '#C1502E',
                        fillColor: '#C1502E',
                        fillOpacity: 0.2,
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
                      fillOpacity: 0.4,
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
            <div key={h.id} className="bg-[#1A1A1A] p-5 rounded-sm border border-[#333333] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#F5F1E8] truncate">{h.name}</span>
                <span className={`px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                  h.intensity === 'high' ? 'badge-terracotta' : 'badge-gold'
                }`}>
                  {h.intensity.toUpperCase()} DEMAND
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
                <span>Open Items Needed:</span>
                <strong className="text-[#F5F1E8]">{h.openDemand}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
                <span>Storage Occupancy:</span>
                <strong className="text-[#F5F1E8]">{h.capacityRatio}%</strong>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
