import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  ArrowLeft,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentLoginPage({ onSwitchToAdmin }) {
  const { loginStudent } = useApp();

  // Login Steps: 'phone' -> 'otp'
  const [step, setStep] = useState('phone');

  // Input states
  const [name, setName] = useState('Raj Snehith');
  const [phone, setPhone] = useState('9989955833');
  
  // OTP state (4-digit code)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [simulatedSmsToast, setSimulatedSmsToast] = useState(null);

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendCountdown]);

  // Focus first OTP input when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        if (otpInputRefs[0].current) {
          otpInputRefs[0].current.focus();
        }
      }, 150);
    }
  }, [step]);

  // Step 1: Send OTP
  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
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

    setIsSendingOtp(true);

    setTimeout(() => {
      // Generate realistic 4-digit OTP
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      setStep('otp');
      setResendCountdown(30);
      setOtpDigits(['', '', '', '']);
      setIsSendingOtp(false);

      // Trigger simulated SMS delivery banner
      setSimulatedSmsToast({
        phone: cleanPhone,
        otp: newOtp
      });
    }, 700);
  };

  // Step 2: Handle Individual Digit Input
  const handleDigitChange = (index, value) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1); // Take last digit if multiple
    setOtpDigits(newDigits);
    setError('');

    // Auto-advance to next input
    if (cleanVal && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Paste Support for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    if (pastedData.length === 4) {
      otpInputRefs[3].current?.focus();
    }
  };

  // Auto-fill OTP shortcut
  const handleAutofill = () => {
    if (!generatedOtp) return;
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    setError('');
    otpInputRefs[3].current?.focus();
  };

  // Resend OTP
  const handleResend = () => {
    if (resendCountdown > 0) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setResendCountdown(30);
    setOtpDigits(['', '', '', '']);
    setError('');

    setSimulatedSmsToast({
      phone: phone.replace(/\D/g, ''),
      otp: newOtp
    });
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP code. Please check the SMS banner or click Resend.');
      return;
    }

    // Success: Login student
    loginStudent({
      name: name.trim(),
      phone: phone.trim(),
      studentId: `AP${phone.slice(-6)}`,
      verified: true
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#FF5722]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Simulated SMS Alert Banner (Floating) */}
      {simulatedSmsToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-down">
          <div className="p-4 rounded-2xl bg-[#0F172A] text-white shadow-2xl border border-slate-700 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center text-white flex-shrink-0">
              <MessageSquare size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#FF8A65] uppercase tracking-wider">SMS Gateway • Just Now</span>
                <span className="text-[10px] text-slate-400 font-mono">+91 {simulatedSmsToast.phone}</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Your CampusBites login OTP is <strong className="text-white text-sm font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded">{simulatedSmsToast.otp}</strong>
              </p>
              <button
                type="button"
                onClick={handleAutofill}
                className="mt-2 text-[11px] font-bold text-[#FF5722] hover:text-[#FF7A50] flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Tap here to Auto-Fill OTP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] mx-auto flex items-center justify-center shadow-xl shadow-[#FF5722]/30 mb-4">
          <span className="text-3xl">🍔</span>
        </div>
        
        <h1 className="text-3xl font-black font-['Outfit'] text-[#0F172A] tracking-tight">
          Campus<span className="text-[#FF5722]">Bites</span>
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#64748B]">
          SRM-AP Campus Food Ordering & Hostel Delivery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-[#F1EAE4]">
          
          {/* Header Title */}
          <div className="mb-6 pb-4 border-b border-[#F1EAE4] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] font-['Outfit']">
                {step === 'phone' ? 'Student Sign In' : 'Verify Mobile OTP'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {step === 'phone' ? 'Quick mobile sign in' : `Code sent to +91 ${phone}`}
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

          {/* STEP 1: MOBILE & NAME INPUT */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
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

              {/* Mobile Phone with +91 Prefix */}
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
                    placeholder="9989955833"
                    className="w-full px-3 py-2.5 text-sm text-[#0F172A] font-semibold tracking-wider focus:outline-none bg-white"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  We'll send a 4-digit verification code to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="btn-primary w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingOtp ? (
                  <span>Sending Code...</span>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
              
              {/* Back to change phone button */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[#64748B] hover:text-[#0F172A] font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent"
                >
                  <ArrowLeft size={13} />
                  <span>Change Number</span>
                </button>
                <span className="text-[#0F172A] font-mono font-bold">+91 {phone}</span>
              </div>

              {/* 4-Digit OTP Boxes */}
              <div>
                <label className="block text-center text-xs font-bold text-[#334155] uppercase tracking-wider mb-3">
                  Enter 4-Digit OTP
                </label>

                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-13 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl border-2 border-[#E2D9D0] bg-[#FAF8F5] text-[#0F172A] focus:bg-white focus:border-[#FF5722] focus:outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Timer */}
              <div className="text-center text-xs">
                {resendCountdown > 0 ? (
                  <p className="text-[#64748B] font-medium">
                    Resend code in <strong className="text-[#FF5722] font-mono">{resendCountdown}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#FF5722] hover:text-[#E64A19] font-extrabold flex items-center gap-1 mx-auto cursor-pointer border-none bg-transparent"
                  >
                    <RefreshCw size={13} />
                    <span>Resend OTP Code</span>
                  </button>
                )}
              </div>

              {/* Verify & Login Button */}
              <button
                type="submit"
                className="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={18} />
                <span>Verify & Enter Kitchens</span>
              </button>
            </form>
          )}

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

        {/* Prototype Footer note */}
        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          SRM-AP Campus Food Ordering Ecosystem • Secure OTP Verification
        </p>
      </div>
    </div>
  );
}
