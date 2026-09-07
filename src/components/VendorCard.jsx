import React from 'react';
import { Star, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function VendorCard({ vendor, onSelectVendor }) {
  return (
    <div
      onClick={() => onSelectVendor(vendor)}
      className="card-base flex flex-col group cursor-pointer"
    >
      {/* Banner */}
      <div className="relative w-full h-36 overflow-hidden bg-[#F1EAE4]">
        <img
          src={vendor.banner}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Vendor Badge */}
        {vendor.badge && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#FF5722] text-[10px] font-bold shadow-md">
            {vendor.badge}
          </div>
        )}

        {/* Free Delivery Tag */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1">
          <Sparkles size={12} />
          <span>{vendor.deliveryFee}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-extrabold text-base text-[#0F172A] group-hover:text-[#FF5722] transition-colors line-clamp-1 font-['Outfit']">
            {vendor.name}
          </h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] text-xs font-black flex-shrink-0">
            <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
            <span>{vendor.rating}</span>
          </div>
        </div>

        <p className="text-xs text-[#64748B] line-clamp-1 mb-2">
          {vendor.cuisine}
        </p>

        <div className="flex items-center gap-3 text-xs text-[#64748B] pt-2 border-t border-[#F1EAE4] mt-auto">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-[#94A3B8]" />
            <span>{vendor.prepTime}</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <MapPin size={12} className="text-[#94A3B8]" />
            <span className="truncate">{vendor.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
