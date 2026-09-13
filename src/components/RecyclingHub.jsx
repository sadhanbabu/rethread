import React, { useEffect, useState } from 'react';
import { Recycle, Scissors, Factory, ShieldCheck, MapPin, Phone, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import BrandedLoader from './BrandedLoader';

export default function RecyclingHub() {
  const [partners, setPartners] = useState([]);
  const [routedItems, setRoutedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/recycling-partners`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/items`).then(r => r.json())
    ])
      .then(([partnersData, itemsData]) => {
        setPartners(partnersData);
        setRoutedItems(itemsData.filter(i => i.condition === 'Needs Repair'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-24 text-center">
        <BrandedLoader text="LOADING RECYCLING NETWORK..." />
      </div>
    );
  }

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
      
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#1A1A1A] rounded-sm p-10 sm:p-14 text-[#F5F1E8] border border-[#333333] relative overflow-hidden"
      >
        <div className="max-w-3xl space-y-6 relative z-10">
          <p className="editorial-label text-[#D4A94A]">CIRCULAR RECOVERY NETWORK</p>

          <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            Zero Garment Waste to Landfill.
          </h1>

          <p className="text-sm sm:text-base text-[#AAAAAA] font-normal leading-[1.7]">
            When donors upload items marked <strong>"Needs Repair"</strong> or heavily worn, ReThread automatically diverts them to specialized material recovery labs, upcycling studios, and industrial fiber mills.
          </p>
        </div>
      </motion.div>

      {/* Auto Routed Items Queue */}
      <div className="card-dark p-8 space-y-6 border border-[#333333]">
        <div className="flex items-center justify-between border-b border-[#333333] pb-4">
          <div>
            <p className="editorial-label text-[#C1502E]">MATERIAL RECOVERY QUEUE</p>
            <h2 className="font-serif text-3xl font-black text-[#F5F1E8]">Auto-Routed Repair & Upcycle Items</h2>
          </div>
          <span className="badge-gold px-3.5 py-1.5 text-[10px] font-bold tracking-widest uppercase">
            {routedItems.length} DIVERTED GARMENTS
          </span>
        </div>

        {routedItems.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#1A1A1A] rounded-sm border border-dashed border-[#333333]">
            <ShieldCheck className="w-8 h-8 text-[#7A9471] mx-auto" strokeWidth={1.75} />
            <p className="font-serif text-xl font-black text-[#F5F1E8]">No damaged garments currently pending</p>
            <p className="text-xs text-[#AAAAAA]">Upload an item with condition "Needs Repair" in the Donor Portal to test auto-routing!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {routedItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants} className="bg-[#1A1A1A] p-6 rounded-sm border border-[#333333] space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.photo_url}
                    alt={item.title}
                    className="w-18 h-18 rounded-sm object-cover border border-[#333333] shrink-0"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"; }}
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="badge-terracotta px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase inline-block">
                      {item.condition}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#F5F1E8] truncate">{item.title}</h4>
                    <p className="text-xs text-[#AAAAAA]">Type: {item.item_type} • Size: {item.size}</p>
                    <p className="text-[11px] text-[#888888]">Donor: {item.donor_name}</p>
                  </div>
                </div>

                <div className="bg-[#242424] p-3 rounded-sm border border-[#333333] text-xs text-[#F5F1E8] flex items-center justify-between">
                  <span>Target Lab: <strong className="text-[#D4A94A]">Bay Area Fiber Recovery</strong></span>
                  <span className="text-[9px] font-bold bg-[#C1502E] text-white px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                    Shredding
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Certified Recycling Partners Directory */}
      <div className="card-dark p-8 space-y-6 border border-[#333333]">
        <div className="border-b border-[#333333] pb-4">
          <p className="editorial-label text-[#D4A94A]">DIRECTORY</p>
          <h2 className="font-serif text-3xl font-black text-[#F5F1E8]">Certified Textile Recycling Partners</h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {partners.map((partner) => (
            <motion.div key={partner.id} variants={itemVariants} className="bg-[#1A1A1A] p-6 rounded-sm border border-[#333333] space-y-4">
              <img
                src={partner.image_url}
                alt={partner.name}
                className="w-full h-40 rounded-sm object-cover border border-[#333333]"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"; }}
              />

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#F5F1E8]">{partner.name}</h3>
                <p className="text-xs font-bold text-[#D4A94A] uppercase tracking-wider">{partner.specialty}</p>
              </div>

              <div className="space-y-1.5 text-xs text-[#AAAAAA]">
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C1502E] shrink-0" strokeWidth={1.75} />
                  <span>{partner.address}</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C1502E] shrink-0" strokeWidth={1.75} />
                  <span>{partner.phone}</span>
                </p>
              </div>

              <div className="p-3 rounded-sm bg-[#242424] border border-[#333333] text-xs">
                <span className="editorial-label text-[8px] text-[#888888] block mb-1">MATERIALS ACCEPTED:</span>
                <p className="text-[#F5F1E8] text-[11px]">{partner.materials_accepted}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
