import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, MapPin, Navigation, Compass } from 'lucide-react';

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
  partnerLocation, // { latitude, longitude, accuracy, timestamp }
  restaurantId,
  restaurantName,
  deliveryLocation,
  partnerName = 'Campus Courier',
  status = 'OUT_FOR_DELIVERY'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const kitchenMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const destCoords = resolveDestinationCoords(deliveryLocation);
  const kitchenCoords = resolveKitchenCoords(restaurantId);

  const partnerLat = partnerLocation?.latitude ? parseFloat(partnerLocation.latitude) : kitchenCoords[0];
  const partnerLng = partnerLocation?.longitude ? parseFloat(partnerLocation.longitude) : kitchenCoords[1];

  // Initialize map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [partnerLat, partnerLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and path when coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const partnerLatLng = [partnerLat, partnerLng];
    const destLatLng = destCoords;
    const kitchenLatLng = kitchenCoords;

    // 1. Kitchen Marker
    if (!kitchenMarkerRef.current) {
      const kitchenIcon = L.divIcon({
        className: 'custom-kitchen-marker',
        html: `
          <div style="
            background: #0F172A;
            color: #FF5722;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">🍳</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      kitchenMarkerRef.current = L.marker(kitchenLatLng, { icon: kitchenIcon })
        .addTo(map)
        .bindPopup(`<strong>${restaurantName || 'Kitchen'}</strong><br><small>Pickup Location</small>`);
    }

    // 2. Destination Marker
    if (!destMarkerRef.current) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="
            background: #10B981;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          ">📍</div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      destMarkerRef.current = L.marker(destLatLng, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<strong>Your Destination</strong><br><small>${deliveryLocation || 'Campus Delivery'}</small>`);
    }

    // 3. Delivery Partner Marker
    const partnerIcon = L.divIcon({
      className: 'custom-partner-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255, 87, 34, 0.25);
            animation: pulse 1.5s infinite;
          "></div>
          <div style="
            position: relative;
            background: #FF5722;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border: 2px solid white;
            box-shadow: 0 4px 14px rgba(255, 87, 34, 0.5);
          ">🛵</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!partnerMarkerRef.current) {
      partnerMarkerRef.current = L.marker(partnerLatLng, { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`<strong>${partnerName}</strong><br><small>Live Delivery Rider</small>`);
    } else {
      partnerMarkerRef.current.setLatLng(partnerLatLng);
    }

    // 4. Route Polyline
    const routePoints = [kitchenLatLng, partnerLatLng, destLatLng];
    if (!routeLineRef.current) {
      routeLineRef.current = L.polyline(routePoints, {
        color: '#FF5722',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);
    } else {
      routeLineRef.current.setLatLngs(routePoints);
    }

    // 5. Fit bounds smoothly
    try {
      const bounds = L.latLngBounds([partnerLatLng, destLatLng, kitchenLatLng]);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 17 });
    } catch (e) {
      // Ignore fit bounds error if map resizing
    }
  }, [partnerLat, partnerLng, deliveryLocation, restaurantId, partnerName]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E2D9D0] shadow-card bg-slate-900">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 text-white flex items-center gap-2 shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold font-['Outfit']">
            Live Courier Tracking • {status === 'PICKED_UP' ? 'Order Picked Up' : 'On The Way 🛵'}
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 text-[#0F172A] text-[11px] font-bold shadow-md pointer-events-auto flex items-center gap-1">
          <Navigation size={12} className="text-[#FF5722]" />
          <span>SRM-AP Campus</span>
        </div>
      </div>

      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-64 sm:h-80 z-0 bg-[#0F172A]"
        style={{ minHeight: '260px' }}
      />

      {/* Map Legend / Bottom Details Overlay */}
      <div className="p-3 bg-white border-t border-[#F1EAE4] flex items-center justify-between gap-3 text-xs text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722]" />
          <span className="font-semibold">{partnerName}</span>
          <span className="text-slate-400 text-[10px]">(Live GPS)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <span>Destination: <strong>{deliveryLocation || 'Hostel'}</strong></span>
        </div>
      </div>
    </div>
  );
}
