import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, ShieldCheck, Sparkles, User, Phone, CheckCircle2 } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

export default function StudentLoginPage() {
  const { sendEmailOtp, verifyEmailOtp, isConfigured } = useStudentAuth();

  const [step, setStep] = useState('ENTER_EMAIL'); // 'ENTER_EMAIL' | 'ENTER_OTP'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. Submit Email -> Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid student email address.' });
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setMessage({ type: 'error', text: 'Please enter your 10-digit mobile number.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await sendEmailOtp(email, name, phone);
    setIsLoading(false);

    if (result.success) {
      setStep('ENTER_OTP');
      setMessage({
        type: 'success',
        text: `6-digit OTP has been sent to ${email}. Please check your Inbox and Spam folder!`
      });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send OTP. Please try again.' });
    }
  };

  // 2. Submit OTP -> Verify & Sign in
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpToken.trim() || otpToken.trim().length < 4) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP sent to your email.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await verifyEmailOtp(email, otpToken, name, phone);
    setIsLoading(false);

    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Invalid or expired OTP. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-[#FF5722]/25 mb-4">
          🍔
        </div>

        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight font-['Outfit']">
          CampusBites Dining
        </h1>
        <p className="mt-1 text-sm text-[#64748B] font-medium">
          SRM-AP Student Food Ordering & Hostel Delivery Portal
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Sparkles size={13} className="text-emerald-600" />
          <span>Real Gmail OTP Verification Active</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-[#F1EAE4] space-y-5">
          
          {/* Status Message */}
          {message && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold leading-relaxed ${
              message.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {message.text}
            </div>
          )}

          {step === 'ENTER_EMAIL' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-[#FF5722]" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E2D9D0] bg-[#FAF8F5] text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#FF5722]" />
                  <span>Student Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. snehithraj007@gmail.com or name@srmap.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E2D9D0] bg-[#FAF8F5] text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white"
                />
                <div className="text-[11px] text-[#64748B] mt-1 space-y-1">
                  <p>We will send your 6-digit login verification OTP to this email.</p>
                  {email.toLowerCase().includes('srmap.edu.in') && (
                    <p className="text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ⚠️ <strong>SRM AP Email Note:</strong> University mail (Outlook) frequently routes new external senders to your <strong>Junk Email</strong> folder. You can also use your personal Gmail for instant delivery!
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#FF5722]" />
                  <span>Mobile Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10digit  mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E2D9D0] bg-[#FAF8F5] text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 mt-2 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#FFF0EB] border border-[#FFD3C4] text-xs text-[#FF5722] flex items-center justify-between">
                <span>Sending to: <strong>{email}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('ENTER_EMAIL')}
                  className="text-xs font-black underline cursor-pointer border-none bg-transparent"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-[#FF5722]" />
                  <span>Enter 6-Digit Email OTP *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={8}
                  placeholder="e.g. 123456"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E2D9D0] bg-[#FAF8F5] text-lg font-mono font-bold tracking-widest text-center text-[#0F172A] focus:outline-none focus:border-[#FF5722] focus:bg-white"
                />
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 mt-2 space-y-1 text-center">
                  <p className="font-bold text-[#FF5722]">
                    📬 Email sent from CampusBites SRM
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    If not in your Primary inbox, please check your <strong>Spam</strong> or <strong>Promotions/Updates</strong> folder in Gmail.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    (Test bypass code: <span className="font-mono font-bold text-slate-600">123456</span>)
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 mt-2 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying OTP...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify & Enter Dining</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-xs font-bold text-[#FF5722] hover:underline cursor-pointer border-none bg-transparent"
                >
                  Didn't receive email? Resend OTP
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security & Access Notice */}
        <p className="mt-6 text-center text-xs text-[#64748B] flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Student Portal Access Protected via Supabase Row Level Security</span>
        </p>
      </div>
    </div>
  );
}
