import React from 'react';
import { Shirt, Package, Building2, Recycle, BarChart3, HeartHandshake, Leaf, RefreshCw, Plus, UserCheck, LogOut, User } from 'lucide-react';

export default function Navbar({ role, finderType, activeTab, setActiveTab, stats, onSwitchRole, currentUser, onLogOut }) {
  
  // Navigation Tabs by Active Role
  const donorNavItems = [
    { id: 'donor', label: 'Donate a Garment', icon: Shirt },
    { id: 'my-donations', label: 'My Donations', icon: Package },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
  ];

  const finderNavItems = [
    { id: 'post-need', label: 'Post a Need', icon: Plus },
    { id: 'incoming', label: 'Incoming Matches', icon: Package },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
  ];

  const navItems = role === 'donor' ? donorNavItems : finderNavItems;

  return (
    <header className="sticky top-0 z-50 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EAE5DC] transition-all">
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A7C59] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2F533A] transition-colors">
              <Leaf className="w-5 h-5 text-[#EBF2ED]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center space-x-1 font-serif text-2xl font-bold tracking-tight text-[#1D2921]">
                <span>Re</span>
                <span className="text-[#4A7C59]">Thread</span>
              </div>
              <p className="text-[10px] uppercase font-semibold tracking-widest text-[#637367]">
                {role === 'donor' ? 'Donor Portal' : `Recipient (${finderType})`}
              </p>
            </div>
          </div>

          {/* Desktop Role-Based Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2 bg-[#F0ECE1] p-1.5 rounded-2xl border border-[#E2DCD2]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'incoming' && activeTab === 'ngo') || (item.id === 'profile' && activeTab === 'ngo');
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

          {/* Right Controls: User Profile & Log Out */}
          <div className="flex items-center space-x-3 shrink-0">
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2DCD2] text-xs">
                <User className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span className="font-semibold text-[#1D2921]">{currentUser.fullName || currentUser.email}</span>
                <span className="bg-[#4A7C59]/10 text-[#4A7C59] px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                  {currentUser.accountType}
                </span>
              </div>
            )}

            <button
              onClick={onLogOut}
              className="btn-secondary py-2 px-3.5 text-xs inline-flex items-center space-x-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              title="Log out of session"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C1502E]" strokeWidth={2} />
              <span>Log Out</span>
            </button>

            {role === 'donor' && (
              <button 
                onClick={() => setActiveTab('donor')}
                className="btn-primary py-2.5 px-4 text-xs hidden lg:flex"
              >
                <Shirt className="w-4 h-4" strokeWidth={1.75} />
                <span>+ Donate</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#EAE5DC] text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'incoming' && activeTab === 'ngo') || (item.id === 'profile' && activeTab === 'ngo');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id === 'donor' ? 'donor' : item.id === 'my-donations' ? 'my-donations' : item.id === 'impact' ? 'impact' : 'ngo')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg shrink-0 ${
                  isActive ? 'text-[#4A7C59] font-bold' : 'text-[#637367]'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" strokeWidth={1.75} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
