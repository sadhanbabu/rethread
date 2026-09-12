import React, { useEffect, useState } from 'react';
import { Recycle, Scissors, Factory, ShieldCheck, MapPin, Phone, ArrowRight, ExternalLink } from 'lucide-react';

export default function RecyclingHub() {
  const [partners, setPartners] = useState([]);
  const [routedItems, setRoutedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/recycling-partners').then(r => r.json()),
      fetch('/api/items').then(r => r.json())
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
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-amber-950">Loading Textile Recycling Network...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-amber-950 via-amber-900 to-[#1D2921] rounded-[24px] p-10 sm:p-14 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-200 text-xs font-semibold backdrop-blur-md">
            <Recycle className="w-4 h-4 text-amber-300" strokeWidth={2} />
            <span>CIRCULAR TEXTILE RECOVERY NETWORK</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15]">
            Zero Garment Waste to Landfill.
          </h1>

          <p className="text-base sm:text-lg text-amber-100/90 font-normal leading-[1.6]">
            When donors upload items marked <strong>"Needs Repair"</strong> or heavily worn, ReThread automatically diverts them to specialized material recovery labs, upcycling studios, and industrial fiber mills.
          </p>
        </div>
      </div>

      {/* Auto Routed Items Queue */}
      <div className="card-static p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Auto-Routed Repair & Upcycle Items</h2>
            <p className="text-xs text-[#637367] mt-0.5">Garments diverted from general shelter queues directly for material processing</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full badge-gradient-amber text-xs font-bold">
            {routedItems.length} Diverted Garments
          </span>
        </div>

        {routedItems.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E2DCD2]">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" strokeWidth={1.75} />
            <p className="text-sm font-bold text-[#1D2921]">No damaged garments currently pending</p>
            <p className="text-xs text-[#637367]">Try uploading an item with condition "Needs Repair" in the Donor Portal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routedItems.map((item) => (
              <div key={item.id} className="card-elevated p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.photo_url}
                    alt={item.title}
                    className="w-18 h-18 rounded-2xl object-cover border border-[#E2DCD2] shrink-0 shadow-sm"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"; }}
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md badge-gradient-amber text-[10px] font-bold">
                      <Recycle className="w-3 h-3 text-amber-700" />
                      <span>{item.condition}</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#1D2921] truncate">{item.title}</h4>
                    <p className="text-xs text-[#637367]">Type: {item.item_type} • Size: {item.size}</p>
                    <p className="text-[11px] text-[#87968B]">Donor: {item.donor_name}</p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                  <span>Target Lab: <strong>Bay Area Fiber Recovery</strong></span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                    Industrial Shredding
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certified Recycling Partners Directory */}
      <div className="card-static p-8 space-y-6">
        <div className="border-b border-[#EAE5DC] pb-4">
          <h2 className="font-serif text-2xl font-bold text-[#1D2921]">Certified Textile Recycling Partners</h2>
          <p className="text-xs text-[#637367] mt-0.5">Local upcyclers, zipper repair shops, and mechanical fiber processors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div key={partner.id} className="card-elevated p-6 space-y-4">
              <img
                src={partner.image_url}
                alt={partner.name}
                className="w-full h-40 rounded-2xl object-cover border border-[#E2DCD2] shadow-sm"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"; }}
              />

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1D2921]">{partner.name}</h3>
                <p className="text-xs font-semibold text-amber-900">{partner.specialty}</p>
              </div>

              <div className="space-y-1.5 text-xs text-[#637367]">
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" strokeWidth={1.75} />
                  <span>{partner.address}</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" strokeWidth={1.75} />
                  <span>{partner.phone}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2DCD2] text-xs">
                <span className="font-bold text-[#1D2921] block mb-1">Materials Accepted:</span>
                <p className="text-[#637367] text-[11px]">{partner.materials_accepted}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
