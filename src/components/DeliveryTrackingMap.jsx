import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Compass, 
  Crosshair, 
  Clock, 
  ExternalLink, 
  Layers, 
  Key, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';

// Real SRM-AP Campus Coordinates (Neerukonda, Amaravati: 16.4631° N, 80.5065° E)
const CAMPUS_LOCATIONS = {
  'local-home-kitchen': [16.4638, 80.5072], // Central Dining Block
  'campus-delight-dhaba': [16.4645, 80.5080], // North Food Court
  'default-kitchen': [16.4638, 80.5072],
  'hostel-a': [16.4618, 80.5050], // Ganga Hostel Block
  'hostel-b': [16.4612, 80.5055], // Yamuna Hostel Block
  'hostel-c': [16.4608, 80.5060], // Krishna Hostel Block
  'default-destination': [16.4612, 80.5055]
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
  // Map Engine Selection: 'google' (default per request) | 'leaflet'
  const [mapEngine, setMapEngine] = useState(() => {
    try {
      return localStorage.getItem('cb_map_engine') || 'google';
    } catch {
      return 'google';
    }
  });

  // Google Maps API Key handling
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    try {
      return localStorage.getItem('cb_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    } catch {
      return '';
    }
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isGoogleJsLoaded, setIsGoogleJsLoaded] = useState(false);
  const [googleJsError, setGoogleJsError] = useState(false);

  // Leaflet refs
  const leafletContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const destMarkerRef = useRef(null);
  const kitchenMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const hasFittedInitialLeafletRef = useRef(false);

  // Google Maps JS API refs
  const googleContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googlePartnerMarkerRef = useRef(null);
  const googleDestMarkerRef = useRef(null);
  const googleKitchenMarkerRef = useRef(null);
  const googlePolylineRef = useRef(null);

  const destCoords = resolveDestinationCoords(deliveryLocation);
  const kitchenCoords = resolveKitchenCoords(restaurantId);

  // Robust coordinate extraction
  const rawLat = partnerLocation?.latitude ?? partnerLocation?.lat;
  const rawLng = partnerLocation?.longitude ?? partnerLocation?.lng;
  const rawAcc = partnerLocation?.accuracy ?? 8;

  const partnerLat = rawLat ? parseFloat(rawLat) : kitchenCoords[0];
  const partnerLng = rawLng ? parseFloat(rawLng) : kitchenCoords[1];
  const accuracy = rawAcc ? Math.max(5, Math.min(parseFloat(rawAcc), 40)) : 8;

  // Real-time distance and ETA
  const distanceToDestMeters = calculateDistanceMeters(partnerLat, partnerLng, destCoords[0], destCoords[1]);
  const etaMinutes = Math.max(1, Math.ceil(distanceToDestMeters / 150));
  const isArrived = distanceToDestMeters <= 50;

  // Google Maps Directions Deep Link
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${partnerLat},${partnerLng}&destination=${destCoords[0]},${destCoords[1]}&travelmode=driving`;

  // Save map engine selection
  const handleSwitchEngine = (engine) => {
    setMapEngine(engine);
    try {
      localStorage.setItem('cb_map_engine', engine);
    } catch (e) {}
  };

  // Save custom Google Maps API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const clean = tempApiKey.trim();
    setGoogleApiKey(clean);
    try {
      if (clean) localStorage.setItem('cb_google_maps_key', clean);
      else localStorage.removeItem('cb_google_maps_key');
    } catch (e) {}
    setIsKeyModalOpen(false);
    setIsGoogleJsLoaded(false);
  };

  // -------------------------------------------------------------
  // GOOGLE MAPS JAVASCRIPT API LOADER (If API key provided)
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'google' || !googleApiKey) {
      return;
    }

    if (window.google?.maps) {
      setIsGoogleJsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleApiKey)}&libraries=geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsGoogleJsLoaded(true);
        setGoogleJsError(false);
      };

      script.onerror = () => {
        console.warn('Google Maps JS API failed to load with provided key.');
        setGoogleJsError(true);
        setIsGoogleJsLoaded(false);
      };

      document.head.appendChild(script);
    } else {
      setIsGoogleJsLoaded(true);
    }
  }, [mapEngine, googleApiKey]);

  // -------------------------------------------------------------
  // GOOGLE MAPS JS INSTANCE INITIALIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'google' || !isGoogleJsLoaded || !window.google?.maps || !googleContainerRef.current) {
      return;
    }

    if (!googleMapRef.current) {
      const gMap = new window.google.maps.Map(googleContainerRef.current, {
        center: { lat: partnerLat, lng: partnerLng },
        zoom: 17,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] }
        ]
      });

      // 1. Kitchen Marker
      googleKitchenMarkerRef.current = new window.google.maps.Marker({
        position: { lat: kitchenCoords[0], lng: kitchenCoords[1] },
        map: gMap,
        title: restaurantName || 'Kitchen Pickup',
        label: { text: '🍳', fontSize: '18px' }
      });

      // 2. Destination Marker
      googleDestMarkerRef.current = new window.google.maps.Marker({
        position: { lat: destCoords[0], lng: destCoords[1] },
        map: gMap,
        title: 'Student Destination',
        label: { text: '📍', fontSize: '20px' }
      });

      // 3. Moving Courier Marker
      googlePartnerMarkerRef.current = new window.google.maps.Marker({
        position: { lat: partnerLat, lng: partnerLng },
        map: gMap,
        title: partnerName,
        label: { text: '🛵', fontSize: '22px' },
        zIndex: 999
      });

      // 4. Polyline Route
      googlePolylineRef.current = new window.google.maps.Polyline({
        path: [
          { lat: kitchenCoords[0], lng: kitchenCoords[1] },
          { lat: partnerLat, lng: partnerLng },
          { lat: destCoords[0], lng: destCoords[1] }
        ],
        geodesic: true,
        strokeColor: '#FF5722',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map: gMap
      });

      // Fit bounds once
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: kitchenCoords[0], lng: kitchenCoords[1] });
      bounds.extend({ lat: partnerLat, lng: partnerLng });
      bounds.extend({ lat: destCoords[0], lng: destCoords[1] });
      gMap.fitBounds(bounds);

      googleMapRef.current = gMap;
    } else {
      // Update courier position and polyline
      if (googlePartnerMarkerRef.current) {
        googlePartnerMarkerRef.current.setPosition({ lat: partnerLat, lng: partnerLng });
      }
      if (googlePolylineRef.current) {
        googlePolylineRef.current.setPath([
          { lat: kitchenCoords[0], lng: kitchenCoords[1] },
          { lat: partnerLat, lng: partnerLng },
          { lat: destCoords[0], lng: destCoords[1] }
        ]);
      }
    }
  }, [mapEngine, isGoogleJsLoaded, partnerLat, partnerLng, kitchenCoords, destCoords, restaurantName, partnerName]);

  // -------------------------------------------------------------
  // OPENSTREETMAP LEAFLET INSTANCE (Rock-solid Fallback / Toggle)
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'leaflet') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        hasFittedInitialLeafletRef.current = false;
        partnerMarkerRef.current = null;
        accuracyCircleRef.current = null;
        destMarkerRef.current = null;
        kitchenMarkerRef.current = null;
        routeLineRef.current = null;
      }
      return;
    }

    if (!leafletContainerRef.current || leafletMapRef.current) return;

    const map = L.map(leafletContainerRef.current, {
      center: [partnerLat, partnerLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMapRef.current = map;

    const t = setTimeout(() => {
      map.invalidateSize();
      try {
        const bounds = L.latLngBounds([
          [partnerLat, partnerLng],
          destCoords,
          kitchenCoords
        ]);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 17 });
      } catch (e) {}
    }, 200);

    return () => {
      clearTimeout(t);
      map.remove();
      leafletMapRef.current = null;
    };
  }, [mapEngine]);

  // Update Leaflet markers on coordinate updates
  useEffect(() => {
    if (mapEngine !== 'leaflet') return;
    const map = leafletMapRef.current;
    if (!map) return;

    const partnerLatLng = [partnerLat, partnerLng];
    const destLatLng = destCoords;
    const kitchenLatLng = kitchenCoords;

    // 1. Kitchen Marker
    if (!kitchenMarkerRef.current) {
      const kitchenIcon = L.divIcon({
        className: 'custom-kitchen-marker',
        html: `<div style="background: #0F172A; color: #FF5722; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">🍳</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      kitchenMarkerRef.current = L.marker(kitchenLatLng, { icon: kitchenIcon }).addTo(map);
    }

    // 2. Destination Marker
    if (!destMarkerRef.current) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `<div style="background: #10B981; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2.5px solid white; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      destMarkerRef.current = L.marker(destLatLng, { icon: destIcon }).addTo(map);
    }

    // 3. Accuracy Circle
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

    // 4. Moving Courier Marker
    const partnerIcon = L.divIcon({
      className: 'custom-partner-marker',
      html: `
        <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(255, 87, 34, 0.3); animation: pulse 1.5s infinite;"></div>
          <div style="position: relative; background: #FF5722; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; border: 2.5px solid white; box-shadow: 0 4px 16px rgba(255, 87, 34, 0.55);">🛵</div>
        </div>
      `,
      iconSize: [46, 46],
      iconAnchor: [23, 23]
    });

    if (!partnerMarkerRef.current) {
      partnerMarkerRef.current = L.marker(partnerLatLng, { icon: partnerIcon }).addTo(map);
    } else {
      partnerMarkerRef.current.setIcon(partnerIcon);
      partnerMarkerRef.current.setLatLng(partnerLatLng);
    }

    // 5. Polyline
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

    // Initial fit once
    if (!hasFittedInitialLeafletRef.current) {
      try {
        const bounds = L.latLngBounds([partnerLatLng, destLatLng, kitchenLatLng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        hasFittedInitialLeafletRef.current = true;
      } catch (e) {}
    }
  }, [mapEngine, partnerLat, partnerLng, accuracy, destCoords, kitchenCoords]);

  // Google Maps Free Embed URL (Zero API Key required, displays real Google Maps terrain & roads)
  const googleEmbedUrl = `https://maps.google.com/maps?q=${partnerLat},${partnerLng}&z=17&output=embed`;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E2D9D0] shadow-card bg-slate-900 select-none">
      {/* Top Floating Telemetry & Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* ETA Badge */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white flex items-center gap-2.5 shadow-xl pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs font-black font-['Outfit'] text-white flex items-center gap-1.5">
              <span>{isArrived ? 'Arrived at Destination! 🎉' : `~${etaMinutes} mins (${distanceToDestMeters}m away)`}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {mapEngine === 'google' ? 'Google Maps Live Tracking 🗺️' : 'OpenStreetMap Live Tracking 🌍'}
            </div>
          </div>
        </div>

        {/* Engine Switcher & External Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {/* Engine Selector */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 text-[11px] shadow-lg">
            <button
              type="button"
              onClick={() => handleSwitchEngine('google')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border-none ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              <span>Google Maps</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchEngine('leaflet')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border-none ${
                mapEngine === 'leaflet'
                  ? 'bg-[#FF5722] text-white shadow-md'
                  : 'bg-transparent text-slate-300 hover:text-white'
              }`}
            >
              <span>OpenStreetMap</span>
            </button>
          </div>

          {/* Open In Native Google Maps App */}
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-[#0F172A] hover:text-blue-600 text-[11px] font-extrabold shadow-md flex items-center gap-1 transition-all no-underline"
            title="Open Live Navigation in Google Maps App"
          >
            <ExternalLink size={12} className="text-blue-600" />
            <span className="hidden sm:inline">Google Maps App</span>
          </a>

          {/* Optional Google API Key Config Button */}
          {mapEngine === 'google' && (
            <button
              type="button"
              onClick={() => {
                setTempApiKey(googleApiKey);
                setIsKeyModalOpen(true);
              }}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Configure Google Maps API Key"
            >
              <Key size={13} />
            </button>
          )}
        </div>
      </div>

      {/* MAP CANVAS VIEWPORTS */}
      {mapEngine === 'google' ? (
        googleApiKey && isGoogleJsLoaded && !googleJsError ? (
          /* 1. Full Google Maps JavaScript API Canvas */
          <div 
            ref={googleContainerRef} 
            className="w-full h-72 sm:h-96 z-0 bg-[#0F172A]"
            style={{ minHeight: '280px' }}
          />
        ) : (
          /* 2. Google Maps Interactive Embed (Works instantly with 0 API Key required!) */
          <div className="relative w-full h-72 sm:h-96 z-0 bg-[#0F172A]" style={{ minHeight: '280px' }}>
            <iframe
              title="Google Maps Live Delivery Location"
              src={googleEmbedUrl}
              width="100%"
              height="100%"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Overlay notification regarding active tracking */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] border border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Google Maps GPS Pin: <strong>{partnerLat.toFixed(5)}, {partnerLng.toFixed(5)}</strong></span>
              </div>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-bold hover:underline"
              >
                Turn-by-turn Route →
              </a>
            </div>
          </div>
        )
      ) : (
        /* 3. OpenStreetMap Leaflet Canvas */
        <div 
          ref={leafletContainerRef} 
          className="w-full h-72 sm:h-96 z-0 bg-[#0F172A]"
          style={{ minHeight: '280px' }}
        />
      )}

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
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {partnerLat.toFixed(5)}, {partnerLng.toFixed(5)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Hostel Drop:</span>
          <strong className="text-[#0F172A]">{deliveryLocation || 'Hostel'}</strong>
        </div>
      </div>

      {/* GOOGLE MAPS API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1E293B] rounded-3xl border border-slate-700 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2 font-black font-['Outfit'] text-base">
                <Key size={16} className="text-amber-400" />
                <span>Google Maps API Settings</span>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border-none"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Maps is already active with the <strong>Zero-Key Interactive Embed</strong>. If you have a Google Cloud API Key with the Maps JavaScript API enabled, you can enter it below to unlock native custom 3D overlays.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Google Maps API Key
                </label>
                <input
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey('');
                    setGoogleApiKey('');
                    try { localStorage.removeItem('cb_google_maps_key'); } catch(e){}
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer border-none shadow-md shadow-blue-500/20"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
