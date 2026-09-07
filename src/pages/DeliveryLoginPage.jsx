import React, { useState, useEffect } from 'react';
import { Bike, ShieldCheck, ArrowRight, UserCheck, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { getDeliveryPartners } from '../lib/api';

export default function DeliveryLoginPage({ onLoginSuccess, onSwitchToStudent, onSwitchToAdmin }) {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPartners() {
      try {
        setIsLoading(true);
        const data = await getDeliveryPartners();
        setPartners(data);
        if (data.length > 0) setSelectedPartnerId(data[0].id);
      } catch (err) {
        console.error('Failed to load partners:', err);
        setError('Could not connect to delivery network');
      } finally {
        setIsLoading(false);
      }
    }
    loadPartners();
  }, []);

  const handlePartnerSelectLogin = (partner) => {
    onLoginSuccess(partner);
  };

  const handleCustomPhoneLogin = (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      setError('Please enter your courier phone number');
      return;
    }
    const cleanPhone = phoneInput.trim();
    const matched = partners.find(p => p.phone.includes(cleanPhone) || cleanPhone.includes(p.phone.replace(/[^0-9]/g, '')));
    if (matched) {
      onLoginSuccess(matched);
    } else {
      // Create lightweight session
      const customPartner = {
        id: `DP-${Math.floor(100 + Math.random() * 900)}`,
        name: `Courier (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        isAvailable: true
      };
      onLoginSuccess(customPartner);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 animate-fade-in font-sans">
      {/* Top Navbar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF7A50] flex items-center justify-center text-white shadow-lg shadow-[#FF5722]/20 font-black text-xl font-['Outfit']">
            CB
          </div>
          <div>
            <span className="font-black text-lg text-white font-['Outfit'] block leading-tight">CampusBites</span>
            <span className="text-[11px] font-bold text-[#FF8A65] tracking-wider uppercase">Delivery Partner Portal</span>
          </div>
        </div>

        <button
          onClick={onSwitchToStudent}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Student App</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-8 bg-[#1E293B] rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-[#FF5722]/15 blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] mx-auto flex items-center justify-center shadow-xl shadow-[#FF5722]/20">
            <Bike size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">Courier Login</h1>
          <p className="text-xs text-slate-400">
            Access assigned campus deliveries, manage orders, and broadcast live GPS tracking.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Quick Select Registered Campus Courier */}
        <div className="space-y-3 relative z-10">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Select Registered Courier:
          </label>

          {isLoading ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin text-[#FF5722]" />
              <span>Loading couriers from Neon...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {partners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => handlePartnerSelectLogin(partner)}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-[#FF5722]/20 border border-slate-700 hover:border-[#FF5722]/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 group-hover:bg-[#FF5722] text-white flex items-center justify-center font-bold text-sm transition-colors">
                      <Bike size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white group-hover:text-[#FF8A65] transition-colors">
                        {partner.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {partner.phone} • <span className="text-emerald-400 font-semibold">{partner.id}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} className="text-slate-500 group-hover:text-[#FF5722] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-700 w-full" />
          <span className="bg-[#1E293B] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            or enter phone
          </span>
        </div>

        {/* 2. Phone Form */}
        <form onSubmit={handleCustomPhoneLogin} className="space-y-3 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Registered Phone Number:
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 7842960252"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#FF5722]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white font-extrabold text-xs shadow-lg shadow-[#FF5722]/30 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <span>Sign In as Courier</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Demo Tip */}
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center text-[11px] text-slate-400">
          💡 <strong>Tip:</strong> Click any courier above to test instant pickup and live location simulation.
        </div>
      </div>

      {/* Footer Switcher */}
      <div className="max-w-md mx-auto w-full text-center space-y-2 text-xs text-slate-500">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onSwitchToStudent}
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-slate-400 font-semibold"
          >
            Student App
          </button>
          <span>•</span>
          <button
            onClick={onSwitchToAdmin}
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-slate-400 font-semibold"
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
