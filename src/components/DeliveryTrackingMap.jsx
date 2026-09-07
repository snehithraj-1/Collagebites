import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, MapPin, Navigation, Compass, Crosshair, ZoomIn, ZoomOut, Clock } from 'lucide-react';

// SRM-AP Campus Coordinates reference
const CAMPUS_LOCATIONS = {
  'local-home-kitchen': [16.5175, 80.5215],
  'campus-delight-dhaba': [16.5170, 80.5220],
  'default-kitchen': [16.5172, 80.5210],
  'hostel-b': [16.5165, 80.5200],
  'hostel-c': [16.5160, 80.5195],
  'hostel-a': [16.5155, 80.5190],
  'default-destination': [16.5160, 80.5195]
};

// Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function resolveDestinationCoords(deliveryLocation) {
  if (!deliveryLocation) return CAMPUS_LOCATIONS['default-destination'];
  const loc = deliveryLocation.toLowerCase();
  if (loc.includes('block a')) return CAMPUS_LOCATIONS['hostel-a'];
  if (loc.includes('block b')) return CAMPUS_LOCATIONS['hostel-b'];
  if (loc.includes('block c')) return CAMPUS_LOCATIONS['hostel-c'];
  return CAMPUS_LOCATIONS['default-destination'];
}

function resolveKitchenCoords(restaurantId) {
  return CAMPUS_LOCATIONS[restaurantId] || CAMPUS_LOCATIONS['default-kitchen'];
}

export default function DeliveryTrackingMap({
  partnerLocation, // { latitude/lat, longitude/lng, accuracy, timestamp }
  restaurantId,
  restaurantName,
  deliveryLocation,
  partnerName = 'Campus Courier',
  status = 'OUT_FOR_DELIVERY'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const destMarkerRef = useRef(null);
  const kitchenMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const hasFittedInitialBoundsRef = useRef(false);

  const destCoords = resolveDestinationCoords(deliveryLocation);
  const kitchenCoords = resolveKitchenCoords(restaurantId);

  // Robust coordinate extraction
  const rawLat = partnerLocation?.latitude ?? partnerLocation?.lat;
  const rawLng = partnerLocation?.longitude ?? partnerLocation?.lng;
  const rawAcc = partnerLocation?.accuracy ?? 10;

  const partnerLat = rawLat ? parseFloat(rawLat) : kitchenCoords[0];
  const partnerLng = rawLng ? parseFloat(rawLng) : kitchenCoords[1];
  const accuracy = rawAcc ? Math.max(5, Math.min(parseFloat(rawAcc), 40)) : 10;

  // Calculate distance remaining and estimated arrival
  const distanceToDestMeters = calculateDistanceMeters(partnerLat, partnerLng, destCoords[0], destCoords[1]);
  const etaMinutes = Math.max(1, Math.ceil(distanceToDestMeters / 150)); // ~9km/h average campus cycling speed
  const isArrived = distanceToDestMeters <= 50;

  // Manual re-center trigger
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      const bounds = L.latLngBounds([
        [partnerLat, partnerLng],
        destCoords,
        kitchenCoords
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17, animate: true });
    } catch (e) {
      console.warn('Recenter failed:', e);
    }
  }, [partnerLat, partnerLng, destCoords, kitchenCoords]);

  // Focus directly on moving courier
  const handleFocusRider = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([partnerLat, partnerLng], 17, { animate: true });
  }, [partnerLat, partnerLng]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [partnerLat, partnerLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // High performance OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Critical fix: Invalidate size after layout settles
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
      handleRecenter();
    }, 200);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render and Smoothly Update Markers & Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const partnerLatLng = [partnerLat, partnerLng];
    const destLatLng = destCoords;
    const kitchenLatLng = kitchenCoords;

    // 1. Kitchen Marker (Fixed)
    if (!kitchenMarkerRef.current) {
      const kitchenIcon = L.divIcon({
        className: 'custom-kitchen-marker',
        html: `
          <div style="
            background: #0F172A;
            color: #FF5722;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          ">🍳</div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      kitchenMarkerRef.current = L.marker(kitchenLatLng, { icon: kitchenIcon })
        .addTo(map)
        .bindPopup(`<strong>${restaurantName || 'Kitchen'}</strong><br><small>Food Pickup Location</small>`);
    }

    // 2. Destination Marker (Fixed)
    if (!destMarkerRef.current) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="
            background: #10B981;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border: 2.5px solid white;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
          ">📍</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      destMarkerRef.current = L.marker(destLatLng, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<strong>Your Destination</strong><br><small>${deliveryLocation || 'Campus Delivery'}</small>`);
    }

    // 3. Dynamic Accuracy Radar Circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle(partnerLatLng, {
        radius: accuracy,
        color: '#FF5722',
        fillColor: '#FF5722',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 3'
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng(partnerLatLng);
      accuracyCircleRef.current.setRadius(accuracy);
    }

    // 4. Moving Delivery Partner Marker (Animated HTML DivIcon)
    const partnerIcon = L.divIcon({
      className: 'custom-partner-marker',
      html: `
        <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: rgba(255, 87, 34, 0.3);
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          "></div>
          <div style="
            position: relative;
            background: #FF5722;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
            border: 2.5px solid white;
            box-shadow: 0 4px 16px rgba(255, 87, 34, 0.55);
            transition: transform 0.3s ease;
          ">🛵</div>
        </div>
      `,
      iconSize: [46, 46],
      iconAnchor: [23, 23]
    });

    if (!partnerMarkerRef.current) {
      partnerMarkerRef.current = L.marker(partnerLatLng, { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`<strong>${partnerName}</strong><br><small>Live Satellite GPS</small>`);
    } else {
      partnerMarkerRef.current.setIcon(partnerIcon);
      partnerMarkerRef.current.setLatLng(partnerLatLng);
    }

    // 5. Route Polyline
    const routePoints = [kitchenLatLng, partnerLatLng, destLatLng];
    if (!routeLineRef.current) {
      routeLineRef.current = L.polyline(routePoints, {
        color: '#FF5722',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);
    } else {
      routeLineRef.current.setLatLngs(routePoints);
    }

    // 6. Intelligent Initial Fit (Runs ONCE so we don't snap/flicker the view during live transit)
    if (!hasFittedInitialBoundsRef.current) {
      try {
        const bounds = L.latLngBounds([partnerLatLng, destLatLng, kitchenLatLng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        hasFittedInitialBoundsRef.current = true;
      } catch (e) {
        // bounds pending container
      }
    } else {
      // If courier moved out of current visible bounds, smoothly pan to track them
      const currentBounds = map.getBounds();
      if (!currentBounds.contains(partnerLatLng)) {
        map.panTo(partnerLatLng, { animate: true, duration: 1 });
      }
    }
  }, [partnerLat, partnerLng, accuracy, deliveryLocation, restaurantId, partnerName]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E2D9D0] shadow-card bg-slate-900 select-none">
      {/* Top Floating ETA & Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white flex items-center gap-2.5 shadow-xl pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs font-black font-['Outfit'] text-white flex items-center gap-1.5">
              <span>{isArrived ? 'Arrived at Destination! 🎉' : `~${etaMinutes} mins (${distanceToDestMeters}m away)`}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {status === 'PICKED_UP' ? 'Picked up from Kitchen' : 'Live GPS Delivery in Transit 🛵'}
            </div>
          </div>
        </div>

        {/* Quick Map Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleRecenter}
            className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 text-[#0F172A] hover:text-[#FF5722] text-[11px] font-extrabold shadow-md flex items-center gap-1 transition-all cursor-pointer"
            title="Fit Entire Delivery Route on Screen"
          >
            <Crosshair size={12} className="text-[#FF5722]" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>

          <button
            type="button"
            onClick={handleFocusRider}
            className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 text-[#0F172A] hover:text-[#FF5722] text-[11px] font-extrabold shadow-md flex items-center gap-1 transition-all cursor-pointer"
            title="Focus On Courier Rider"
          >
            <Bike size={12} className="text-emerald-600" />
            <span className="hidden sm:inline">Focus Rider</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-72 sm:h-96 z-0 bg-[#0F172A]"
        style={{ minHeight: '280px' }}
      />

      {/* Map Legend & GPS Telemetry Footer */}
      <div className="p-3 sm:p-3.5 bg-white border-t border-[#F1EAE4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722]" />
            <span className="font-bold text-[#0F172A]">{partnerName}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold font-mono">
            <span>Accuracy: ~{accuracy}m</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Destination:</span>
          <strong className="text-[#0F172A]">{deliveryLocation || 'Hostel'}</strong>
        </div>
      </div>
    </div>
  );
}
