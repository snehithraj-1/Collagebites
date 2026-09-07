import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Utensils,
  Bike
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentLoginPage({ onSwitchToAdmin, onSwitchToDelivery }) {
  const { loginStudent } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      loginStudent({
        name: cleanName,
        phone: cleanPhone,
        studentId: `AP${cleanPhone.slice(-6)}`
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#FF5722]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] mx-auto flex items-center justify-center shadow-xl shadow-[#FF5722]/30 mb-4">
          <span className="text-3xl">🍔</span>
        </div>
        
        <h1 className="text-3xl font-black font-['Outfit'] text-[#0F172A] tracking-tight">
          Campus<span className="text-[#FF5722]">Bites</span>
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#64748B]">
          SRM-AP University Food Ordering & Hostel Delivery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-[#F1EAE4]">
          
          {/* Header Title */}
          <div className="mb-6 pb-4 border-b border-[#F1EAE4] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] font-['Outfit']">
                Student Sign In
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Enter your name & phone to order
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Campus Verified</span>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          {/* Simplified Student Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User size={13} className="text-[#FF5722]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your Full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
              />
            </div>

            {/* Mobile Number with +91 Prefix */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-[#FF5722]" />
                <span>Mobile Number</span>
              </label>
              <div className="flex rounded-xl border border-[#E2D9D0] overflow-hidden focus-within:border-[#FF5722] focus-within:ring-1 focus-within:ring-[#FF5722]">
                <div className="px-3 py-2.5 bg-[#FAF8F5] border-r border-[#E2D9D0] text-xs font-bold text-[#475569] flex items-center gap-1.5 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your no"
                  className="w-full px-3.5 py-2.5 text-sm text-[#0F172A] font-semibold tracking-wider focus:outline-none bg-white"
                />
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Used for order updates and kitchen delivery contact.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Entering Dining...</span>
              ) : (
                <>
                  <Utensils size={17} />
                  <span>Enter Campus Dining</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Other Campus Portals */}
          <div className="mt-6 pt-5 border-t border-[#F1EAE4] space-y-2 text-center">
            <button
              type="button"
              onClick={onSwitchToDelivery}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bike size={15} className="text-amber-600" />
              <span>Delivery Partner Sign In & Live GPS 🛵</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4EFEA] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none bg-transparent"
            >
              <Lock size={13} />
              <span>Campus Manager / Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Prototype Footer note */}
        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          SRM-AP Campus Food Ordering Ecosystem • Instant Access
        </p>
      </div>
    </div>
  );
}
