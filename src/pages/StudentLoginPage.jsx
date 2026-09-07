import React, { useState } from 'react';
import { User, GraduationCap, Phone, MapPin, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';

export default function StudentLoginPage({ onSwitchToAdmin }) {
  const { loginStudent } = useApp();

  const [name, setName] = useState('Raj Snehith');
  const [studentId, setStudentId] = useState('AP22110010482');
  const [phone, setPhone] = useState('9989955833');
  const [hostel, setHostel] = useState('Hostel Block B (Boys)');
  const [roomNumber, setRoomNumber] = useState('Room 412');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!studentId.trim()) {
      setError('Please enter your Student ID or Roll Number');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    loginStudent({
      name: name.trim(),
      studentId: studentId.trim().toUpperCase(),
      phone: phone.trim(),
      hostel: hostel,
      roomNumber: roomNumber.trim()
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem */}
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
          <div className="mb-6 pb-4 border-b border-[#F1EAE4] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] font-['Outfit']">Student Sign In</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Enter details to access campus dining</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Campus Verified</span>
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Name */}
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
                placeholder="e.g. Raj Snehith"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
              />
            </div>

            {/* Student Roll / ID */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-[#FF5722]" />
                <span>Student ID / Roll No</span>
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. AP22110010482"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-sm text-[#0F172A] uppercase focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-[#FF5722]" />
                <span>Mobile Phone (for delivery alerts)</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
              />
            </div>

            {/* Campus Drop-off Spot */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#FF5722]" />
                <span>Default Hostel / Drop-Off Spot</span>
              </label>
              <select
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-xs font-semibold text-[#0F172A] bg-white focus:outline-none focus:border-[#FF5722]"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                Room / Floor Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 412"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Campus Dining</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Switch to Admin Portal */}
          <div className="mt-6 pt-5 border-t border-[#F1EAE4] text-center">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="text-xs font-bold text-[#64748B] hover:text-[#FF5722] flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer border-none bg-transparent"
            >
              <Lock size={13} />
              <span>Campus Manager / Admin Sign In</span>
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          SRM-AP Campus Food Ordering Ecosystem • Prototype
        </p>
      </div>
    </div>
  );
}
