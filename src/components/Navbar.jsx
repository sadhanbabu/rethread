import React from 'react';
import { Shirt, Building2, Recycle, BarChart3, HeartHandshake, Leaf } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  const navItems = [
    { id: 'donor', label: 'Donor Portal', icon: Shirt },
    { id: 'ngo', label: 'NGO Dashboard', icon: Building2 },
    { id: 'recycling', label: 'Recycling Hub', icon: Recycle },
    { id: 'impact', label: 'Impact Map', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F9F6F0]/90 backdrop-blur-md border-b border-[#EAE5DC] transition-all">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('donor')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A7C59] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2F533A] transition-colors">
              <Leaf className="w-5 h-5 text-[#EBF2ED]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center space-x-1 font-serif text-2xl font-bold tracking-tight text-[#1D2921]">
                <span>Re</span>
                <span className="text-[#4A7C59]">Thread</span>
              </div>
              <p className="text-[10px] uppercase font-semibold tracking-widest text-[#637367]">Circularity Platform</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2 bg-[#F0ECE1] p-1.5 rounded-2xl border border-[#E2DCD2]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-[#1D2921] shadow-sm font-bold scale-[1.01]'
                      : 'text-[#637367] hover:text-[#1D2921] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4A7C59]' : 'text-[#87968B]'}`} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live Impact Header Counter */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full badge-gradient-sage text-xs font-semibold">
              <HeartHandshake className="w-4 h-4 text-[#4A7C59]" strokeWidth={1.75} />
              <span>{stats?.itemsRedistributed || 29} Items Redistributed</span>
            </div>

            <button 
              onClick={() => setActiveTab('donor')}
              className="btn-primary"
            >
              <Shirt className="w-4 h-4" strokeWidth={1.75} />
              <span>Donate Garment</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-[#EAE5DC] text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                  isActive ? 'text-[#4A7C59] font-bold' : 'text-[#637367]'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
