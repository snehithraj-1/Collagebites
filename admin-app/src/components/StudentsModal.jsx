import React, { useState, useEffect } from 'react';
import { X, Search, Phone, Mail, User, Users, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function StudentsModal({ isOpen, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) ||
      (s.phone || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111C34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-lg border border-blue-400/30">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Outfit'] text-white">
                Registered Students Directory
              </h2>
              <p className="text-xs text-slate-400">
                {students.length} students registered at SRM University AP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, phone number, or SRM email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading student records...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No students found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStudents.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                        {s.name ? s.name[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs sm:text-sm">
                          {s.name || 'Anonymous Student'}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {(s.id || '').toString().slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 pt-1">
                    {s.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-orange-400">
                        <Phone size={12} />
                        <a href={`tel:${s.phone}`} className="hover:underline">{s.phone}</a>
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                        <Mail size={12} />
                        <span>{s.email}</span>
                      </div>
                    )}
                    {s.created_at && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                        <Calendar size={11} />
                        <span>Joined: {new Date(s.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
